/**
 * Thin, resilient wrapper around the Anthropic SDK for the content pipeline.
 *
 * Exposes three call shapes the agents need:
 *   - callStructured()    — strict JSON output validated against a schema
 *   - callWithWebSearch() — server-side web search, returns prose text
 *   - callText()          — plain text generation (long-form article)
 *
 * Plus helpers: extractJson() for parsing model text, and withRetry() for
 * exponential-backoff retries on transient (429 / 5xx / network) failures.
 *
 * Large, reusable system prompts are sent as a cached content block
 * (cache_control: ephemeral) so repeated daily runs pay the ~0.1x cache-read
 * price instead of full input price on the shared brand/safety preamble.
 */

import Anthropic from "@anthropic-ai/sdk";
import { getApiKey, RETRY } from "@/lib/agents/config";
import type { Logger } from "@/lib/agents/logger";

let _client: Anthropic | null = null;

export function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: getApiKey() });
  return _client;
}

/** Web-search tool version. Override if your account pins a different one. */
const WEB_SEARCH_TOOL = process.env.AGENT_WEB_SEARCH_TOOL || "web_search_20260209";

/* ------------------------------------------------------------------ *
 * Retry
 * ------------------------------------------------------------------ */

function isRetryable(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) {
    const status = err.status ?? 0;
    return status === 429 || status >= 500;
  }
  // Network errors (no status) are worth a retry.
  return err instanceof Error && /(ECONN|ETIMEDOUT|fetch failed|network)/i.test(err.message);
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

/** Concatenate all text blocks from a message response. */
function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Robustly pull a JSON value out of model text: strips ```json fences, then
 * falls back to the first balanced {...} or [...] span. Throws on failure.
 */
export function extractJson<T = unknown>(text: string): T {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
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
        if (depth === 0) {
          const span = cleaned.slice(start, i + 1);
          return JSON.parse(span) as T;
        }
      }
    }
  }
  throw new Error("Could not extract JSON from model response.");
}

function systemBlocks(system: string): Anthropic.TextBlockParam[] {
  // Single cached block — the brand/safety preamble is large and reused.
  return [{ type: "text", text: system, cache_control: { type: "ephemeral" } }];
}

/**
 * Strip JSON-Schema keywords that structured outputs don't support
 * (numeric/length/array constraints, patterns). Validation of those is done in
 * the agents themselves; sending them risks a 400. Returns a deep-cleaned copy.
 */
const UNSUPPORTED_SCHEMA_KEYS = new Set([
  "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
  "minLength", "maxLength", "minItems", "maxItems", "uniqueItems", "pattern",
]);

function sanitizeSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(sanitizeSchema);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      if (UNSUPPORTED_SCHEMA_KEYS.has(k)) continue;
      out[k] = sanitizeSchema(v);
    }
    return out;
  }
  return node;
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
}

/**
 * Strict structured output. Constrains the model to `schema` (JSON Schema) via
 * output_config and returns the parsed object. Do NOT use with web search.
 */
export async function callStructured<T>(
  opts: BaseCall & { schema: Record<string, unknown> }
): Promise<T> {
  const { system, user, model, schema, maxTokens = 8000, logger, label = "callStructured" } = opts;
  return withRetry(
    label,
    async () => {
      const params: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        system: systemBlocks(system),
        messages: [{ role: "user", content: user }],
        output_config: { format: { type: "json_schema", schema: sanitizeSchema(schema) } },
      };
      const message = (await client().messages.create(params as any)) as Anthropic.Message;
      const raw = textOf(message);
      logger?.debug(`${label} usage: ${JSON.stringify(message.usage)}`);
      return extractJson<T>(raw);
    },
    logger
  );
}

/**
 * Plain long-form text generation. Streams under the hood to avoid HTTP
 * timeouts on large outputs (the article writer needs room).
 */
export async function callText(opts: BaseCall): Promise<string> {
  const { system, user, model, maxTokens = 16000, logger, label = "callText" } = opts;
  return withRetry(
    label,
    async () => {
      const params: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        system: systemBlocks(system),
        messages: [{ role: "user", content: user }],
      };
      const stream = client().messages.stream(params as any);
      const message = await stream.finalMessage();
      logger?.debug(`${label} usage: ${JSON.stringify(message.usage)}`);
      return textOf(message);
    },
    logger
  );
}

/**
 * Web-search-backed generation. Declares the server-side web_search tool, lets
 * Claude run its search loop (handling `pause_turn`), and returns the final
 * prose text. If the tool version isn't available on the account, it retries
 * once WITHOUT search so the pipeline degrades gracefully to model knowledge.
 */
export async function callWithWebSearch(opts: BaseCall): Promise<string> {
  const { system, user, model, maxTokens = 8000, logger, label = "callWithWebSearch" } = opts;

  const run = async (withSearch: boolean): Promise<string> => {
    const params: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      system: systemBlocks(system),
      messages: [{ role: "user", content: user }] as Anthropic.MessageParam[],
    };
    if (withSearch) params.tools = [{ type: WEB_SEARCH_TOOL, name: "web_search" }];

    const messages = params.messages as Anthropic.MessageParam[];
    // Server tools can pause; resume up to a few times.
    for (let i = 0; i < 6; i++) {
      const message = (await client().messages.create(params as any)) as Anthropic.Message;
      logger?.debug(`${label} stop=${message.stop_reason} usage=${JSON.stringify(message.usage)}`);
      if (message.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: message.content });
        continue;
      }
      return textOf(message);
    }
    throw new Error(`${label}: exceeded web-search continuation limit`);
  };

  return withRetry(
    label,
    async () => {
      try {
        return await run(true);
      } catch (err) {
        if (err instanceof Anthropic.BadRequestError) {
          logger?.warn(`${label}: web search unavailable (${err.message}); falling back to model knowledge`);
          return await run(false);
        }
        throw err;
      }
    },
    logger
  );
}
