/**
 * STEP 1 — Trend Research Agent.
 *
 * Scans the live web for what the 20–35 audience is actively searching for and
 * discussing across the 15 allowed evergreen categories, pulling signal from
 * multiple reputable sources (tech blogs, design publications, product-launch
 * trackers, reputable trend reports).
 *
 * Runs on the research model with the server-side web_search tool, then parses
 * the model's JSON text into a typed candidate list for the Topic Selector.
 * Output is intentionally broad (8–12 candidates) so the next step has real
 * choice; brand-safety is reasserted here as defence in depth.
 */

import { callWithWebSearch, extractJson } from "@/lib/agents/claude";
import { MODELS, ALLOWED_CATEGORIES } from "@/lib/agents/config";
import { systemFor } from "@/lib/agents/prompts";
import type {
  AgentContext,
  TrendCandidate,
  TrendResearchResult,
} from "@/lib/agents/types";

const CATEGORY_SLUGS = ALLOWED_CATEGORIES.map((c) => `${c.slug} (${c.name})`).join("\n");

const SYSTEM = systemFor(`You are the Trend Research analyst — a sharp editor who knows exactly what internet-native 20–35 year-olds are searching for and talking about right now.

Your job: research the live web and surface the most promising EVERGREEN topic candidates for an upcoming blog post. Pull signal from MULTIPLE reputable sources — tech blogs, design publications, product-launch trackers (Product Hunt-style), and credible trend reports — and cross-reference before trusting a trend.

You may ONLY suggest topics that fit one of these allowed category slugs (use the slug exactly):
${CATEGORY_SLUGS}

Every "suggestedCategory" you return MUST be one of the slugs above.

Brand safety — non-negotiable: pick only positive, helpful, evergreen ideas. NEVER suggest news, current events, politics, government/policy, crime, accidents, disasters, deaths, violence, war, celebrity gossip/drama/scandals, religion, financial/investment/trading advice, medical/health/mental-health/pharmaceutical advice, legal advice, anything tied to a specific date or expiring event, or any adult/gambling/weapons/unsafe material. If a trend touches a forbidden area, drop it and find a safe evergreen alternative.

Favour topics with durable, repeatable search demand (how-tos, comparisons, explainers, tool round-ups, frameworks) over flash-in-the-pan moments.`);

export async function trendResearch(ctx: AgentContext): Promise<TrendResearchResult> {
  ctx.logger.forStep("trend-research").info("Researching current evergreen trends for the 20–35 audience");

  const user = `Research the web NOW and identify the strongest evergreen topic candidates the audience is actively searching for and discussing across the allowed categories.

For each candidate, judge:
- searchDemand (0–100): how much 20–35 year-olds are currently searching / discussing it.
- evergreenScore (0–100): how long it will stay useful (higher = more durable).
- sources: the publications / sites where you saw the signal.

Return 8–12 candidates spanning a few different categories. Return ONLY a JSON object (no prose, no markdown, no code fence) with this exact shape:
{
  "candidates": [
    {
      "topic": "short topic phrase",
      "why": "why it is trending / interesting to the audience right now",
      "suggestedCategory": "one slug from the allowed list",
      "searchDemand": 0,
      "evergreenScore": 0,
      "sources": ["Publication or site name", "..."]
    }
  ]
}`;

  const raw = await callWithWebSearch({
    system: SYSTEM,
    user,
    model: MODELS.research,
    maxTokens: 2500,
    logger: ctx.logger,
    label: "trend-research",
  });

  const parsed = extractJson<{ candidates?: TrendCandidate[] }>(raw);
  const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];

  ctx.logger.info(`Found ${candidates.length} trend candidates`);
  return { candidates };
}
