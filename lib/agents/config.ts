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
  writer: process.env.AGENT_MODEL_WRITER || "openai/gpt-oss-120b",
  /** Research — on the big model for deeper, richer briefs (quality matters). */
  research: process.env.AGENT_MODEL_RESEARCH || "openai/gpt-oss-120b",
  /** SEO analysis / optimisation — small/fast model. */
  seo: process.env.AGENT_MODEL_SEO || "openai/gpt-oss-20b",
  /** Cheap, high-volume utility calls (topic pick, image prompt, tagging). */
  utility: process.env.AGENT_MODEL_UTILITY || "openai/gpt-oss-20b",
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

/**
 * Hand-picked Unsplash photo IDs per category for cover images. Served from
 * Unsplash's static CDN (images.unsplash.com) — no API key, very reliable.
 * (LoremFlickr was used before but started returning HTTP 500 for every image
 * in Nov 2026.) Add more IDs to a pool to get more variety in that category.
 */
// Every ID below was checked to load and visually matched to its category;
// photos with prominent brand logos or price charts were left out.
const TECH = [
  "1518770660439-4636190af475", "1531297484001-80022131f5a1", "1550751827-4bd374c3f58b", "1488590528505-98d2b5aba04b",
  "1519389950473-47ba0277781c", "1526374965328-7f61d4dc18c5", "1504384308090-c894fdcc538d", "1496065187959-7f07b8353c55",
];
const AI = [
  "1677442136019-21780ecad995", "1620712943543-bcc4688e7485", "1485827404703-89b55fcc595e",
  "1655720828018-edd2daec9349", "1694903089438-bf28d4697d9a", "1684369175833-4b445ad6bfb5",
];
const SOFTWARE = [
  "1461749280684-dccba630e2f6", "1498050108023-c5249f4df085", "1517694712202-14dd9538aa97", "1512941937669-90a1b58e7e9c",
  "1555066931-4365d14bab8c", "1587620962725-abab7fe55159", "1551650975-87deedd944c3",
];
const INTERNET = [
  "1563986768609-322da13575f3", "1550745165-9bc0b252726f", "1607746882042-944635dfe10e",
  "1550439062-609e1531270e", "1538481199705-c710c4e965fc",
];
const SOCIAL = [
  "1611162616305-c69b3fa7fbe0", "1611605698335-8b1569810432", "1512941937669-90a1b58e7e9c",
  "1563986768494-4dee2763ff3f", "1432888498266-38ffec3eaf0a",
];
const LIFESTYLE = [
  "1493612276216-ee3925520721", "1522202176988-66273c2fd55f", "1499750310107-5fef28a66643", "1517048676732-d65bc937f952",
  "1515378791036-0648a3ef77b2", "1556761175-b413da4baf72", "1524758631624-e2822e304c36",
];
const ART = [
  "1513364776144-60967b0f800f", "1460661419201-fd4cecdf8a8b", "1452802447250-470a88ac82bc", "1456086272160-b28b0645b729",
];
const CATEGORY_COVER_POOLS: Record<string, string[]> = {
  "artificial-intelligence": AI,
  "ai-tools": [...AI, "1488590528505-98d2b5aba04b", "1531297484001-80022131f5a1", "1551650975-87deedd944c3"],
  technology: TECH,
  "software-apps": SOFTWARE,
  "future-tech": [
    "1451187580459-43490279c0fa", "1535223289827-42f1e9919769", "1485827404703-89b55fcc595e",
    "1581091226825-a6a2a5aee158", "1526628953301-3e589a6a8b74", "1446776811953-b23d57bd21aa",
  ],
  productivity: [
    "1454165804606-c3d57bc86b40", "1484480974693-6ca0a78fb36b", "1497032628192-86f99bcd76bc", "1499750310107-5fef28a66643",
    "1506784983877-45594efa4cbe", "1611224923853-80b023f02d71", "1434030216411-0b793f4b4173", "1517842645767-c639042777db",
  ],
  "graphic-design": [
    "1558655146-9f40138edfeb", "1561070791-2526d30994b5", "1626785774573-4b799315345d", "1513364776144-60967b0f800f",
    "1609921212029-bb5a28e60960", "1572044162444-ad60f128bdea", "1600132806370-bf17e65e942f",
  ],
  "social-media": SOCIAL,
  "creator-economy": [
    "1492691527719-9d1e07e534b4", "1516035069371-29a1b244cc32", "1478737270239-2f02b77fc618",
    "1598550476439-6847785fcea6", "1590602847861-f357a9332bbc", "1533750349088-cd871a92f312",
  ],
  "digital-lifestyle": LIFESTYLE,
  "internet-culture": INTERNET,
  "consumer-products": [
    "1505740420928-5e560c06d30e", "1523275335684-37898b6baf30", "1542291026-7eec264c27ff",
    "1546868871-7041f2a55e12", "1572635196237-14b3f281503f", "1526170375885-4d8ecf77b99f",
  ],
  cars: [
    "1593941707882-a5bba14938c7", "1503376780353-7e6692767b70", "1494976388531-d1058494cdd8", "1492144534655-ae79c964c9d7",
    "1560958089-b8a1929cea89", "1617788138017-80ad40651399", "1549317661-bd32c8ce0db2", "1502877338535-766e1452684a",
    "1580273916550-e323be2ae537",
  ],
  crypto: ["1518546305927-5a555bb7020d", "1639762681485-074b7f938ba0", "1622630998477-20aa696ecb05", "1516245834210-c4c142787335"],
  travel: [
    "1488646953014-85cb44e25828", "1469854523086-cc02fe5d8800", "1476514525535-07fb3b4ae5f1", "1507525428034-b723cf961d3e",
    "1530789253388-582c481c54b0", "1501785888041-af3ef285b470", "1436491865332-7a61a109cc05", "1503220317375-aaad61436b1b",
  ],
  fashion: [
    "1445205170230-053b83016050", "1490481651871-ab68de25d43d", "1483985988355-763728e1935b",
    "1515886657613-9f3515b0c78f", "1509631179647-0177331693ae", "1441984904996-e0b6ba687e04", "1539109136881-3be0616acf4b",
  ],
  skincare: [
    "1570172619644-dfd03ed5d881", "1598440947619-2c35fc9aa908",
    "1620916566398-39f1143ab7be", "1608248543803-ba4f8c70ae0b", "1612817288484-6f916006741a",
  ],
  // Legacy categories that may exist on older posts.
  creativity: ART,
  "viral-trends": [...INTERNET, ...SOCIAL],
  lifestyle: LIFESTYLE,
  "music-culture": [
    "1470225620780-dba8ba36b745", "1493225457124-a3eb161ffa5f", "1511379938547-c1f69419868d",
    "1514525253161-7a46d19cd819", "1459749411175-04bf5292ceea", "1507838153414-b4b713384a76",
  ],
};

/**
 * Pick a topic-relevant cover image for a post. The slug hash keeps the
 * choice stable per post (it doesn't change on every page load).
 */
export function coverImageFor(category: string, slug: string): string {
  const pool = CATEGORY_COVER_POOLS[category] || TECH;
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const id = pool[Math.abs(h) % pool.length];
  return `https://images.unsplash.com/photo-${id}?w=1600&h=900&fit=crop&q=80&auto=format`;
}
