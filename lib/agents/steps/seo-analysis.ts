/**
 * STEP 3 — SEO Analysis Agent.
 *
 * Takes the chosen topic (title, angle, search intent) and produces a focused
 * keyword + SEO plan for an evergreen post aimed at 20–35 year-olds: the
 * primary keyword, supporting secondary keywords, the canonical search intent,
 * difficulty/opportunity estimates, a clean URL slug, and a few click-worthy
 * title options.
 *
 * This is a cheap, deterministic structured call — no web search — so it runs
 * on the SEO model and returns strict JSON validated against the SeoAnalysis
 * schema.
 */

import { callStructured } from "@/lib/agents/claude";
import { MODELS, CATEGORY_NAME_BY_SLUG } from "@/lib/agents/config";
import { systemFor } from "@/lib/agents/prompts";
import type { AgentContext, SeoAnalysis, TopicSelection } from "@/lib/agents/types";

const SYSTEM = systemFor(`You are the SEO Analyst — an experienced organic-search strategist for a modern evergreen blog.

Given a chosen topic, its angle, and the reader's search intent, you produce a tight keyword and on-page SEO plan that ranks AND reads well for internet-native 20–35 year-olds.

Your analysis must:
- Pick ONE primaryKeyword: the realistic head/long-tail phrase a real person would type — specific enough to win, broad enough to have demand. Lowercase.
- Provide 4–8 secondaryKeywords: closely related terms, variations, and semantic/entity keywords that support the primary one (no duplicates of it).
- Classify searchIntent as exactly one of: "informational", "commercial", "navigational", "transactional".
- Estimate difficulty (0–100): higher = harder to rank (more authority/competition needed).
- Estimate opportunityScore (0–100): higher = better demand-to-difficulty payoff for a young, evergreen-focused blog.
- Propose recommendedSlug: lowercase, hyphen-separated, ASCII a–z/0–9 only, no stopword padding ("the/and/of/for/a/to" trimmed), no trailing/leading hyphens, and at most 70 characters.
- Offer 4–6 titleIdeas: each <= 60 characters, click-worthy without clickbait, and weaving in the primary keyword idea naturally.

BRAND SAFETY: only the 15 allowed evergreen categories above are in scope. Never optimise for or drift into news, politics, crime, celebrity/gossip, religion, financial/investment, medical/health, legal, time-sensitive/expiring, or any unsafe topic. Keep keywords evergreen and helpful.`);

/** JSON Schema mirroring the SeoAnalysis return type (strict). */
const SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    primaryKeyword: { type: "string" },
    secondaryKeywords: { type: "array", items: { type: "string" } },
    searchIntent: {
      type: "string",
      enum: ["informational", "commercial", "navigational", "transactional"],
    },
    difficulty: { type: "number", minimum: 0, maximum: 100 },
    opportunityScore: { type: "number", minimum: 0, maximum: 100 },
    recommendedSlug: { type: "string" },
    titleIdeas: { type: "array", items: { type: "string" } },
  },
  required: [
    "primaryKeyword",
    "secondaryKeywords",
    "searchIntent",
    "difficulty",
    "opportunityScore",
    "recommendedSlug",
    "titleIdeas",
  ],
  additionalProperties: false,
};

/** Normalise a model-suggested slug to the lowercase/hyphenated <=70-char contract. */
function normalizeSlug(slug: string): string {
  const cleaned = (slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (cleaned.length <= 70) return cleaned;
  // Trim to the last whole word boundary within 70 chars.
  const cut = cleaned.slice(0, 70);
  const lastHyphen = cut.lastIndexOf("-");
  return (lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut).replace(/-+$/g, "");
}

export async function analyzeSeo(
  topic: TopicSelection,
  ctx: AgentContext
): Promise<SeoAnalysis> {
  ctx.logger.forStep("seo-analysis").info(`Analyzing SEO for: "${topic.workingTitle}"`);

  const user = `Produce the SEO analysis for this evergreen post.

WORKING TITLE: ${topic.workingTitle}
ANGLE: ${topic.angle}
CATEGORY: ${CATEGORY_NAME_BY_SLUG[topic.category] || topic.category}
SEARCH INTENT (from topic selection): ${topic.searchIntent}
RATIONALE: ${topic.rationale}

Target audience: internet-native readers aged 20–35.

Return the keyword and SEO analysis as the structured object.`;

  const result = await callStructured<SeoAnalysis>({
    system: SYSTEM,
    user,
    model: MODELS.seo,
    schema: SCHEMA,
    logger: ctx.logger,
    label: "seo-analysis",
  });

  // Shape/guard the model output against the SeoAnalysis contract.
  const seo: SeoAnalysis = {
    primaryKeyword: (result.primaryKeyword || "").trim(),
    secondaryKeywords: result.secondaryKeywords || [],
    searchIntent: result.searchIntent,
    difficulty: Math.max(0, Math.min(100, Math.round(result.difficulty))),
    opportunityScore: Math.max(0, Math.min(100, Math.round(result.opportunityScore))),
    recommendedSlug: normalizeSlug(result.recommendedSlug),
    titleIdeas: result.titleIdeas || [],
  };

  ctx.logger.info(
    `SEO ready: "${seo.primaryKeyword}" (${seo.searchIntent}), difficulty ${seo.difficulty}, opportunity ${seo.opportunityScore}, slug "${seo.recommendedSlug}"`
  );
  return seo;
}
