/**
 * Central configuration for the Trending Vichaar autonomous content agent.
 *
 * Everything tunable about the daily pipeline lives here: the model split,
 * the allowed categories, the brand-safety rules, the target audience, and
 * the retry/scheduling knobs. Keep this the single source of truth so the
 * nine agents stay consistent.
 */

/**
 * Groq (free, OpenAI-compatible Llama) model IDs, split by job. The 70B model
 * handles writing/research/SEO well; the fast 8B model covers cheap utility
 * calls to stay light on rate limits.
 */
export const MODELS = {
  /** The headline article — the only step on the big model (best quality). */
  writer: process.env.AGENT_MODEL_WRITER || "llama-3.3-70b-versatile",
  /** Web-research — small/fast model to conserve the big model's daily budget. */
  research: process.env.AGENT_MODEL_RESEARCH || "llama-3.1-8b-instant",
  /** SEO analysis / optimisation — small/fast model. */
  seo: process.env.AGENT_MODEL_SEO || "llama-3.1-8b-instant",
  /** Cheap, high-volume utility calls (topic pick, image prompt, tagging). */
  utility: process.env.AGENT_MODEL_UTILITY || "llama-3.1-8b-instant",
} as const;

/** The agent's author identity on published posts. */
export const AGENT_AUTHOR = {
  name: process.env.AGENT_AUTHOR_NAME || "Trending Vichaar",
  bio:
    process.env.AGENT_AUTHOR_BIO ||
    "The Trending Vichaar editorial desk — daily evergreen reads on AI, design, tech and digital culture.",
} as const;

/** Who we write for. Drives topic selection and tone. */
export const TARGET_AUDIENCE =
  "internet-native readers aged 20–35 who care about AI, technology, design, productivity, creators, and digital lifestyle";

/** Article length guardrails (word count). */
export const WORD_RANGE = { min: 1500, max: 2500 } as const;

/**
 * The ONLY categories the agent may publish into. Each `slug` MUST exist in
 * CATEGORY_LIST (lib/utils.ts) or the post won't render on a category page.
 */
export const ALLOWED_CATEGORIES = [
  { slug: "artificial-intelligence", name: "Artificial Intelligence" },
  { slug: "ai-tools", name: "AI Tools" },
  { slug: "technology", name: "Technology" },
  { slug: "software-apps", name: "Software & Apps" },
  { slug: "future-tech", name: "Future Technology" },
  { slug: "productivity", name: "Productivity" },
  { slug: "graphic-design", name: "Graphic Design" },
  { slug: "social-media", name: "Social Media Tips" },
  { slug: "creator-economy", name: "Creator Economy" },
  { slug: "digital-lifestyle", name: "Digital Lifestyle" },
  { slug: "internet-culture", name: "Internet Culture" },
  { slug: "consumer-products", name: "Trending Consumer Products" },
  { slug: "cars", name: "Cars & EVs" },
  { slug: "crypto", name: "Crypto & Blockchain (educational)" },
  { slug: "travel", name: "Travel" },
  { slug: "fashion", name: "Fashion" },
  { slug: "skincare", name: "Skincare" },
] as const;

export type AllowedCategorySlug = (typeof ALLOWED_CATEGORIES)[number]["slug"];

export const ALLOWED_CATEGORY_SLUGS = ALLOWED_CATEGORIES.map((c) => c.slug);

/**
 * Topics the agent must NEVER produce. Enforced both in the topic-selection
 * agent (hard reject) and reasserted in every system prompt (defence in depth).
 */
export const FORBIDDEN_TOPICS = [
  "news / current events / breaking news",
  "politics, elections, government, policy debates",
  "crime, accidents, disasters, deaths, violence, war / conflict",
  "celebrity gossip, personal drama, scandals, controversies",
  "religion, religious practices or beliefs",
  "financial / investment / trading advice or stock picks",
  "medical, health, mental-health, or pharmaceutical advice",
  "legal advice",
  "anything tied to a specific date, ongoing event, or that expires quickly (not evergreen)",
  "adult / NSFW content, gambling, weapons, or other unsafe material",
  "copyrighted text reproduced verbatim",
] as const;

/** The brand-safety clause injected into every system prompt. */
export const BRAND_SAFETY_CLAUSE = `BRAND SAFETY — NON-NEGOTIABLE.
Trending Vichaar publishes ONLY positive, helpful, evergreen content in these areas:
${ALLOWED_CATEGORIES.map((c) => `- ${c.name}`).join("\n")}

You must NEVER produce, reference, or build content around:
${FORBIDDEN_TOPICS.map((t) => `- ${t}`).join("\n")}

If a topic touches any forbidden area, reject it and choose a safe evergreen alternative.

CATEGORY FRAMING — these categories are allowed ONLY in their evergreen form:
- Cars & EVs: buying guides, EV vs petrol explainers, car-tech and feature explainers, maintenance/ownership tips, "best X for Y" comparisons. NEVER report new-launch news, release dates, spec leaks, or current on-road prices (they go stale and you have no live data).
- Crypto & Blockchain: ONLY educational explainers — how blockchain/wallets/staking work, security and scam-avoidance basics, key terminology, real-world use-cases. NEVER give price predictions, market/news updates, "should you buy/sell", investment/trading advice, or token recommendations.
- AI / AI Tools: lean into practical AI applications and real-world use-cases (what to use, how to use it, workflows) rather than company news.
Keep everything timeless: a reader should find it just as useful a year from now.`;

/** Retry behaviour for transient API / network failures. */
export const RETRY = {
  /** Per-agent-step retries on retryable errors (429 / 413 / 5xx / network).
   *  More attempts + longer max delay so we can wait out Groq's per-minute
   *  token limit (resets within ~60s). */
  maxAttempts: Number(process.env.AGENT_MAX_ATTEMPTS || 5),
  baseDelayMs: 2000,
  maxDelayMs: 40000,
} as const;

/** Scheduling. Daily at 21:00 in IST. */
export const SCHEDULE = {
  /** node-cron expression, evaluated in the timezone below. */
  cron: process.env.AGENT_CRON || "0 21 * * *",
  timezone: "Asia/Kolkata",
} as const;

/** How many recent topics to consider when preventing repetition. */
export const TOPIC_HISTORY_WINDOW = Number(process.env.AGENT_TOPIC_WINDOW || 60);

/**
 * Title-similarity threshold (0–1, Jaccard over word sets) above which a new
 * topic is treated as a duplicate of a recent one.
 */
export const DUPLICATE_TITLE_THRESHOLD = 0.6;

/** Shared secret guarding the /api/agent/run trigger endpoint. */
export const TRIGGER_SECRET = process.env.AGENT_TRIGGER_SECRET || "";

/** Resolve the Groq API key, throwing a clear error if missing. */
export function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Get a free key at https://console.groq.com and add it to .env.local before running the content agent."
    );
  }
  return key;
}

/** Human-readable map of slug -> display name for prompts. */
export const CATEGORY_NAME_BY_SLUG: Record<string, string> = Object.fromEntries(
  ALLOWED_CATEGORIES.map((c) => [c.slug, c.name])
);
