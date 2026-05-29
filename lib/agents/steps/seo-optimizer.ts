/**
 * STEP 7 — SEO Optimizer Agent.
 *
 * Takes the finished article plus the earlier topic + keyword analysis and
 * derives the final on-page SEO package: the SEO/meta titles, meta description,
 * URL slug, a keyword set, internal-linking suggestions, category + tag
 * recommendations, and the ready-to-post social/Pinterest copy.
 *
 * This is a structured, deterministic step (no web search), so it runs on the
 * SEO model and returns strict JSON validated against the SeoPackage schema.
 */

import { callStructured } from "@/lib/agents/claude";
import { MODELS, ALLOWED_CATEGORY_SLUGS } from "@/lib/agents/config";
import { systemFor } from "@/lib/agents/prompts";
import type {
  AgentContext,
  GeneratedArticle,
  InternalLinkSuggestion,
  SeoAnalysis,
  SeoPackage,
  TopicSelection,
} from "@/lib/agents/types";

const SYSTEM = systemFor(`You are the SEO Optimizer — a technical-SEO + growth editor who packages a finished article for maximum organic reach and social shareability.

BRAND SAFETY — NON-NEGOTIABLE. Every field you produce (titles, descriptions, keywords, tags, social and Pinterest copy) must stay strictly within Trending Vichaar's 15 allowed evergreen categories: Artificial Intelligence, AI Tools, Technology, Software & Apps, Future Technology, Productivity, Graphic Design, Social Media Tips, Creator Economy, Digital Lifestyle, Internet Culture, Trending Consumer Products, Travel, Fashion, and Skincare. NEVER produce or imply news, current events, politics, government, crime, accidents, disasters, celebrity gossip, scandals, religion, financial/investment/trading advice, medical/health advice, legal advice, adult/NSFW, gambling, or weapons content. If any input drifts toward a forbidden area, keep your output safe and evergreen.

Your job is to derive the final SEO package from the supplied article and keyword analysis. Follow these rules exactly:
- seoTitle: compelling, click-worthy, includes the primary keyword idea, MUST be 60 characters or fewer.
- metaTitle: the <title>/og:title — keyword-led and benefit-driven (about 50–60 chars).
- metaDescription: a persuasive summary that earns the click, MUST be 160 characters or fewer.
- slug: lowercase, hyphenated, ASCII, no stop-word clutter; reuse/refine the recommended slug.
- keywords: EXACTLY 10 distinct, relevant search keywords/phrases (mix of the primary, secondaries, and tight long-tail variants). No duplicates, no keyword stuffing.
- internalLinks: EXACTLY 5 suggestions, each with natural anchor text and a related on-site targetTopic the link should point to (related evergreen topics, not this same article).
- categorySuggestions: EXACTLY 3 category slugs, each chosen ONLY from the allowed slug list provided in the prompt.
- tags: 3–8 short, lowercase topical tags.
- socialCaption: one ready-to-post caption (X/Instagram/LinkedIn-friendly), 1–2 sentences plus a few relevant hashtags.
- pinterestTitle: a curiosity-driven Pinterest pin title (about 40–100 chars).
- pinterestDescription: a keyword-rich Pinterest pin description (about 150–500 chars) ending with a soft call to action.

Return only data that matches the requested JSON shape — no commentary.`);

/** JSON Schema mirroring SeoPackage so the model is constrained to the contract. */
const SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    seoTitle: { type: "string" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    slug: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    internalLinks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          anchor: { type: "string" },
          targetTopic: { type: "string" },
        },
        required: ["anchor", "targetTopic"],
        additionalProperties: false,
      },
    },
    categorySuggestions: {
      type: "array",
      items: { type: "string", enum: ALLOWED_CATEGORY_SLUGS },
    },
    tags: { type: "array", items: { type: "string" } },
    socialCaption: { type: "string" },
    pinterestTitle: { type: "string" },
    pinterestDescription: { type: "string" },
  },
  required: [
    "seoTitle",
    "metaTitle",
    "metaDescription",
    "slug",
    "keywords",
    "internalLinks",
    "categorySuggestions",
    "tags",
    "socialCaption",
    "pinterestTitle",
    "pinterestDescription",
  ],
  additionalProperties: false,
};

export async function optimizeSeo(
  article: GeneratedArticle,
  topic: TopicSelection,
  seo: SeoAnalysis,
  ctx: AgentContext
): Promise<SeoPackage> {
  ctx.logger.forStep("seo-optimizer").info(`Optimizing SEO package for: "${article.title}"`);

  const user = `Build the final SEO package for this article.

ARTICLE TITLE: ${article.title}
EXCERPT: ${article.excerpt}
ANGLE: ${topic.angle}
SEARCH INTENT: ${seo.searchIntent} — ${topic.searchIntent}
PRIMARY KEYWORD: ${seo.primaryKeyword}
SECONDARY KEYWORDS: ${seo.secondaryKeywords.join(", ")}
RECOMMENDED SLUG: ${seo.recommendedSlug}

ALLOWED CATEGORY SLUGS (pick exactly 3 from this list):
${ALLOWED_CATEGORY_SLUGS.join(", ")}

Hard requirements:
- keywords: EXACTLY 10 strings.
- internalLinks: EXACTLY 5 objects of { anchor, targetTopic }.
- categorySuggestions: EXACTLY 3 slugs from the allowed list above.
- tags: 3–8 strings.
- seoTitle ≤ 60 chars; metaDescription ≤ 160 chars; slug lowercase-hyphenated.

Return ONLY a JSON object matching the requested shape.`;

  const pkg = await callStructured<SeoPackage>({
    system: SYSTEM,
    user,
    model: MODELS.seo,
    schema: SCHEMA,
    logger: ctx.logger,
    label: "seo-optimizer",
  });

  // Shape defensively so downstream steps always get well-formed arrays.
  const result: SeoPackage = {
    seoTitle: pkg.seoTitle,
    metaTitle: pkg.metaTitle,
    metaDescription: pkg.metaDescription,
    slug: pkg.slug,
    keywords: pkg.keywords || [],
    internalLinks: (pkg.internalLinks || []) as InternalLinkSuggestion[],
    categorySuggestions: pkg.categorySuggestions || [],
    tags: pkg.tags || [],
    socialCaption: pkg.socialCaption,
    pinterestTitle: pkg.pinterestTitle,
    pinterestDescription: pkg.pinterestDescription,
  };

  ctx.logger.info(
    `SEO package ready: slug="${result.slug}", ${result.keywords.length} keywords, ` +
      `${result.internalLinks.length} internal links, ${result.tags.length} tags`
  );
  return result;
}
