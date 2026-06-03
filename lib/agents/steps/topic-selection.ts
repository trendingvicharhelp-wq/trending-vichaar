/**
 * STEP 2 — Topic Selection Agent.
 *
 * Takes the trend candidates from Step 1 and picks the single best topic to
 * write about today. It scores each candidate on evergreen potential, SEO
 * opportunity, search demand, reader interest, educational value, and brand
 * safety, hard-rejecting anything that touches a forbidden area or closely
 * matches a recently published title.
 *
 * Runs on the cheap utility model with strict structured output — the choice
 * is a small, well-constrained decision, not long-form generation.
 */

import { callStructured } from "@/lib/agents/claude";
import { MODELS, ALLOWED_CATEGORY_SLUGS, CATEGORY_NAME_BY_SLUG } from "@/lib/agents/config";
import { systemFor } from "@/lib/agents/prompts";
import type {
  AgentContext,
  TopicSelection,
  TrendResearchResult,
} from "@/lib/agents/types";

const SYSTEM = systemFor(`You are the Topic Selection Editor — the decisive human editor who looks at the day's trend candidates and bets on the ONE topic worth writing.

BRAND SAFETY — REASSERT.
You may only choose evergreen, positive, helpful topics that fit one of these 15 categories:
${ALLOWED_CATEGORY_SLUGS.map((s) => `- ${s} (${CATEGORY_NAME_BY_SLUG[s]})`).join("\n")}

You must NEVER choose anything about news, current events, politics, government, elections, crime, accidents, disasters, violence, war, celebrity gossip or drama, religion, financial/investment/trading advice, medical/health advice, legal advice, adult/NSFW, gambling, weapons, copyrighted text, or anything tied to a specific date or expiring event.

Your selection process:
1. Score each candidate on evergreen potential, SEO opportunity, search demand, reader interest, educational value, and brand safety.
2. Reject any candidate that is news/politics/crime/celebrity/sensitive/copyrighted or otherwise forbidden.
3. Reject (or substantially re-angle) any candidate that repeats or closely matches a recently published title — we never publish near-duplicates.
4. Pick the single best remaining candidate and sharpen it into a concrete, original angle with a clear search intent.

The chosen "category" MUST be one of the allowed slugs above. "brandSafe" must be true: if every candidate is unsafe, pick the safest evergreen alternative within an allowed category and still return brandSafe true.`);

const SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    workingTitle: { type: "string" },
    angle: { type: "string" },
    category: { type: "string", enum: ALLOWED_CATEGORY_SLUGS },
    rationale: { type: "string" },
    searchIntent: { type: "string" },
    brandSafe: { type: "boolean" },
  },
  required: [
    "workingTitle",
    "angle",
    "category",
    "rationale",
    "searchIntent",
    "brandSafe",
  ],
  additionalProperties: false,
};

export async function selectTopic(
  trends: TrendResearchResult,
  recentTitles: string[],
  ctx: AgentContext,
  targetCategory?: string
): Promise<TopicSelection> {
  ctx.logger
    .forStep("topic-selection")
    .info(`Selecting topic from ${trends.candidates.length} candidates`);

  const candidatesJson = JSON.stringify(trends.candidates, null, 2);
  const recentList = recentTitles.length
    ? recentTitles.map((t) => `- ${t}`).join("\n")
    : "(none yet)";

  const catName = targetCategory ? CATEGORY_NAME_BY_SLUG[targetCategory] || targetCategory : "";
  const requireCat = targetCategory
    ? ` The topic MUST be in the "${catName}" category — set "category" to exactly "${targetCategory}". Choose the most compelling, distinct angle within this category.`
    : "";

  const user = `Pick the single best topic to write today.${requireCat}

CANDIDATE TOPICS (JSON):
${candidatesJson}

RECENTLY PUBLISHED TITLES — do NOT repeat or closely match any of these:
${recentList}

Choose the strongest evergreen, brand-safe candidate. Apply the scoring and the hard rejections (news/politics/crime/celebrity/sensitive/copyrighted and near-duplicates of the recent titles). Set "category" to one of the allowed slugs and make sure "brandSafe" is true.

Return ONLY a JSON object with this exact shape:
{
  "workingTitle": "a compelling working title / headline for the chosen topic",
  "angle": "the specific angle that makes it worth reading",
  "category": "one of the allowed category slugs",
  "rationale": "why this topic beat the others (cite the scoring factors)",
  "searchIntent": "what the reader is trying to accomplish",
  "brandSafe": true
}`;

  const selection = await callStructured<TopicSelection>({
    system: SYSTEM,
    user,
    model: MODELS.utility,
    schema: SCHEMA,
    logger: ctx.logger,
    label: "topic-selection",
  });

  ctx.logger.info(
    `Selected: "${selection.workingTitle}" [${selection.category}] (brandSafe=${selection.brandSafe})`
  );
  return selection;
}
