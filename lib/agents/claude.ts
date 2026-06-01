/**
 * AI provider client for the content pipeline.
 *
 * NOTE: despite the filename, this wraps **Groq** (free, OpenAI-compatible
 * Llama models) via its REST API. The exported function names are kept stable
 * so the nine agents and the orchestrator don't change — this file is the
 * single integration point. To switch providers, edit only this file + the
 * model IDs in config.ts.
 *
 * Exposes:
 *   - callStructured()    — JSON output (Groq JSON mode), parsed + returned
 *   - callWithWebSearch() — no live search on Groq; returns model-knowledge JSON
 *   - callText()          — plain text generation (long-form article)
 * Plus: extractJson() and withRetry().
 */

import { getApiKey, RETRY } from "@/lib/agents/config";
import type { Logger } from "@/lib/agents/logger";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/* ------------------------------------------------------------------ *
 * Retry
 * ------------------------------------------------------------------ */

function isRetryable(err: unknown): boolean {
  const status = Number((err as { status?: number })?.status ?? 0);
  if (status === 429 || status === 413 || status >= 500) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /(429|413|rate.?limit|tokens per minute|TPM|request too large|over.?loaded|timeout|ECONN|ETIMEDOUT|fetch failed|5\d\d)/i.test(
    msg
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withRetry<T>(label: string, fn: () => Promise<T>, logger?: Logger): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRY.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!isRetryable(err) || attempt === RETRY.maxAttempts) {
        logger?.error(`${label} failed (attempt ${attempt}/${RETRY.maxAttempts}): ${msg}`);
        throw err;
      }
      // Honour Groq's own "try again in X.Xs" hint when present (precise wait
      // for the per-minute reset); otherwise exponential backoff.
      const hint = /try again in ([\d.]+)\s*s/i.exec(msg);
      const delay = hint
        ? Math.min(RETRY.maxDelayMs, Math.ceil(parseFloat(hint[1]) * 1000) + 1500)
        : Math.min(RETRY.maxDelayMs, RETRY.baseDelayMs * 2 ** (attempt - 1));
      logger?.warn(`${label} retryable error (attempt ${attempt}): ${msg} — retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

/* ------------------------------------------------------------------ *
 * Core chat call (Groq, OpenAI-compatible)
 * ------------------------------------------------------------------ */

async function chat(opts: {
  system: string;
  user: string;
  model: string;
  maxTokens: number;
  jsonMode: boolean;
}): Promise<string> {
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    max_tokens: opts.maxTokens,
    temperature: 0.8,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Groq ${res.status}: ${detail.slice(0, 300)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return (data?.choices?.[0]?.message?.content ?? "").trim();
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/** Robustly pull a JSON value out of model text. */
export function extractJson<T = unknown>(text: string): T {
  const cleaned = (text || "").replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    /* fall through */
  }
  const start = cleaned.search(/[\[{]/);
  if (start !== -1) {
    const open = cleaned[start];
    const close = open === "{" ? "}" : "]";
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') inStr = true;
      else if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1)) as T;
      }
    }
  }
  throw new Error("Could not extract JSON from model response.");
}

/* ------------------------------------------------------------------ *
 * Call shapes
 * ------------------------------------------------------------------ */

export interface BaseCall {
  system: string;
  user: string;
  model: string;
  maxTokens?: number;
  logger?: Logger;
  label?: string;
  /** Accepted for compatibility; Groq/Llama has no separate thinking budget. */
  thinkingBudget?: number;
}

/** Strict-ish structured output: Groq JSON mode + schema-described prompt. */
export async function callStructured<T>(
  opts: BaseCall & { schema: Record<string, unknown> }
): Promise<T> {
  const { system, user, model, maxTokens = 2500, logger, label = "callStructured" } = opts;
  // JSON mode requires the word "json" in the prompt — also nudges the model.
  const jsonUser = `${user}\n\nRespond with a single valid JSON object only.`;
  return withRetry(
    label,
    async () => {
      const raw = await chat({ system, user: jsonUser, model, maxTokens, jsonMode: true });
      return extractJson<T>(raw);
    },
    logger
  );
}

/** Plain long-form text generation (the article writer). */
export async function callText(opts: BaseCall): Promise<string> {
  const { system, user, model, maxTokens = 6000, logger, label = "callText" } = opts;
  return withRetry(label, () => chat({ system, user, model, maxTokens, jsonMode: false }), logger);
}

/**
 * "Web search" call. Groq has no live search, so this is a normal completion
 * from model knowledge. Its callers instruct JSON output, so we use JSON mode
 * and let the caller parse with extractJson().
 */
export async function callWithWebSearch(opts: BaseCall): Promise<string> {
  const { system, user, model, maxTokens = 3000, logger, label = "callWithWebSearch" } = opts;
  const jsonUser = `${user}\n\nRespond with a single valid JSON object only.`;
  return withRetry(label, () => chat({ system, user: jsonUser, model, maxTokens, jsonMode: true }), logger);
}
