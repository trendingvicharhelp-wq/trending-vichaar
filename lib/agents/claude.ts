/**
 * AI provider client for the content pipeline.
 *
 * NOTE: despite the filename, this now wraps **Google Gemini** (`@google/genai`).
 * The exported function names are kept stable so the nine agents and the
 * orchestrator don't need to change — this file is the single integration
 * point. To switch providers again, you only edit this file + the model IDs
 * in config.ts.
 *
 * Exposes:
 *   - callStructured()    — strict JSON output validated against a schema
 *   - callWithWebSearch() — Google Search grounding, returns prose text
 *   - callText()          — plain text generation (long-form article)
 * Plus: extractJson() and withRetry().
 */

import { GoogleGenAI } from "@google/genai";
import { getApiKey, RETRY } from "@/lib/agents/config";
import type { Logger } from "@/lib/agents/logger";

let _client: GoogleGenAI | null = null;

export function client(): GoogleGenAI {
  if (!_client) _client = new GoogleGenAI({ apiKey: getApiKey() });
  return _client;
}

/* ------------------------------------------------------------------ *
 * Retry
 * ------------------------------------------------------------------ */

function statusOf(err: unknown): number {
  const anyErr = err as { status?: number; code?: number };
  return Number(anyErr?.status ?? anyErr?.code ?? 0);
}

function isRetryable(err: unknown): boolean {
  const status = statusOf(err);
  if (status === 429 || status >= 500) return true;
  const msg = err instanceof Error ? err.message : String(err);
  // Gemini surfaces rate limits / transient issues by name too.
  return /(429|RESOURCE_EXHAUSTED|UNAVAILABLE|INTERNAL|DEADLINE|ECONN|ETIMEDOUT|fetch failed|overloaded|503|500)/i.test(
    msg
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  logger?: Logger
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRY.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const retryable = isRetryable(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (!retryable || attempt === RETRY.maxAttempts) {
        logger?.error(`${label} failed (attempt ${attempt}/${RETRY.maxAttempts}): ${msg}`);
        throw err;
      }
      const delay = Math.min(RETRY.maxDelayMs, RETRY.baseDelayMs * 2 ** (attempt - 1));
      logger?.warn(`${label} retryable error (attempt ${attempt}): ${msg} — retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/**
 * Robustly pull a JSON value out of model text: strips ```json fences, then
 * falls back to the first balanced {...} or [...] span. Throws on failure.
 */
export function extractJson<T = unknown>(text: string): T {
  const cleaned = (text || "").replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    /* fall through to span extraction */
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

/**
 * Convert our lowercase JSON-Schema (as the agents author it) into Gemini's
 * responseSchema shape: uppercase `type`, only the supported keywords. Numeric
 * / length constraints and additionalProperties are dropped.
 */
const TYPE_MAP: Record<string, string> = {
  object: "OBJECT",
  array: "ARRAY",
  string: "STRING",
  number: "NUMBER",
  integer: "INTEGER",
  boolean: "BOOLEAN",
  null: "NULL",
};

function toGeminiSchema(node: any): any {
  if (!node || typeof node !== "object") return node;
  const out: Record<string, any> = {};
  if (typeof node.type === "string") out.type = TYPE_MAP[node.type] || node.type.toUpperCase();
  if (node.enum) out.enum = node.enum;
  if (node.description) out.description = node.description;
  if (node.items) out.items = toGeminiSchema(node.items);
  if (node.properties) {
    out.properties = {};
    for (const [k, v] of Object.entries(node.properties)) out.properties[k] = toGeminiSchema(v);
    // Preserve a stable field order for the model.
    out.propertyOrdering = Object.keys(node.properties);
  }
  if (Array.isArray(node.required)) out.required = node.required;
  return out;
}

function textOf(response: any): string {
  // The SDK exposes a convenience getter; fall back to manual extraction.
  const t = typeof response?.text === "string" ? response.text : response?.text?.();
  if (t) return String(t).trim();
  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: any) => p?.text ?? "").join("").trim();
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
  /** Gemini thinking budget. 0 disables thinking (frees the budget for output). */
  thinkingBudget?: number;
}

/**
 * Strict structured output. Constrains Gemini to JSON matching `schema` and
 * returns the parsed object.
 */
export async function callStructured<T>(
  opts: BaseCall & { schema: Record<string, unknown> }
): Promise<T> {
  const { system, user, model, schema, maxTokens = 8000, logger, label = "callStructured", thinkingBudget } = opts;
  return withRetry(
    label,
    async () => {
      const response = await client().models.generateContent({
        model,
        contents: user,
        config: {
          systemInstruction: system,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(schema),
          // thinkingConfig is only valid on 2.5-tier models.
          ...(thinkingBudget !== undefined && model.includes("2.5")
            ? { thinkingConfig: { thinkingBudget } }
            : {}),
        },
      });
      const raw = textOf(response);
      logger?.debug(`${label} usage: ${JSON.stringify((response as any)?.usageMetadata ?? {})}`);
      return extractJson<T>(raw);
    },
    logger
  );
}

/**
 * Plain long-form text generation (the article writer). Thinking is disabled so
 * the entire output-token budget goes to the article, not internal reasoning —
 * otherwise Gemini 2.5 spends most of the budget "thinking" and under-writes.
 */
export async function callText(opts: BaseCall): Promise<string> {
  const { system, user, model, maxTokens = 20000, logger, label = "callText" } = opts;
  return withRetry(
    label,
    async () => {
      const response = await client().models.generateContent({
        model,
        contents: user,
        config: {
          systemInstruction: system,
          maxOutputTokens: maxTokens,
          // thinkingConfig is only valid on 2.5-tier models.
          ...(model.includes("2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      });
      logger?.debug(`${label} usage: ${JSON.stringify((response as any)?.usageMetadata ?? {})}`);
      return textOf(response);
    },
    logger
  );
}

/**
 * Web-search-backed generation via Gemini's Google Search grounding. Returns
 * the final prose text. The agents that use this instruct the model to return
 * ONLY JSON, which the caller then parses with extractJson(). Falls back to a
 * plain (ungrounded) call if grounding is unavailable, so the pipeline degrades
 * gracefully to model knowledge.
 */
export async function callWithWebSearch(opts: BaseCall): Promise<string> {
  const { system, user, model, maxTokens = 8000, logger, label = "callWithWebSearch" } = opts;

  const run = async (withSearch: boolean): Promise<string> => {
    const response = await client().models.generateContent({
      model,
      contents: user,
      config: {
        systemInstruction: system,
        maxOutputTokens: maxTokens,
        ...(withSearch ? { tools: [{ googleSearch: {} }] } : {}),
        // Disable thinking on 2.5-tier models so the budget goes to the JSON output.
        ...(model.includes("2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    });
    logger?.debug(`${label} usage: ${JSON.stringify((response as any)?.usageMetadata ?? {})}`);
    return textOf(response);
  };

  const disabled = process.env.AGENT_DISABLE_WEB_SEARCH === "1";
  return withRetry(
    label,
    async () => {
      try {
        return await run(!disabled);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Only fall back for "tool/grounding not supported" type errors, never rate limits.
        if (!isRetryable(err) && /(tool|grounding|search|not supported|invalid)/i.test(msg)) {
          logger?.warn(`${label}: web search unavailable (${msg}); falling back to model knowledge`);
          return await run(false);
        }
        throw err;
      }
    },
    logger
  );
}
