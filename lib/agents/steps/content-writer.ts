/**
 * STEP 5 — Content Writer Agent.
 *
 * Turns the research brief into a complete, human-sounding, SEO-optimised
 * article. It writes the body as PLAIN Markdown (no JSON wrapper) so the model
 * is free to write long and we never hit JSON-escaping failures; the title,
 * excerpt, key takeaways, and FAQs are then derived from that Markdown.
 *
 * Runs on the writer model with thinking disabled (handled in claude.ts for
 * 2.5-tier models) so the whole token budget goes to the article.
 */

import { callText } from "@/lib/agents/claude";
import { MODELS, WORD_RANGE, CATEGORY_NAME_BY_SLUG } from "@/lib/agents/config";
import { HUMAN_VOICE_RULES, systemFor } from "@/lib/agents/prompts";
import { wordCount as countWords } from "@/lib/agents/scoring";
import { makeExcerpt } from "@/lib/utils";
import type {
  AgentContext,
  Faq,
  GeneratedArticle,
  ResearchBrief,
  SeoAnalysis,
  TopicSelection,
} from "@/lib/agents/types";

const SYSTEM = systemFor(`You are the Content Writer — a senior human blogger who writes the kind of post people bookmark and share.

${HUMAN_VOICE_RULES}

Write the FULL article as GitHub-flavoured Markdown with this structure:
1. A hook introduction (2–3 short paragraphs, NO heading) that earns the next scroll.
2. The main body using "##" for H2 sections and "###" for H3 subsections (follow the provided outline, improve it where useful).
3. A "## Key Takeaways" section with 4–6 bullet points (each line starting with "- ").
4. A "## Frequently Asked Questions" section with each question as a "### " heading followed by a 2–4 sentence answer.
5. A "## Conclusion" section that lands the point and gently invites the reader to act.

Hard rules:
- Output ONLY the Markdown article — no JSON, no code fences, no preamble like "Here is".
- Do NOT use a top-level "#" heading (the title is rendered separately).
- Length: ${WORD_RANGE.min}–${WORD_RANGE.max} words. This is a hard requirement — write in depth with specific examples; never stop short.
- Weave the primary keyword in naturally (early, in a couple of H2s, and the conclusion) — never keyword-stuff.`);

/** Return the body text under a `## <heading>` section, up to the next `##`. */
function sectionBody(md: string, headingPattern: string): string {
  const re = new RegExp(`^##\\s+${headingPattern}.*$`, "im");
  const m = md.match(re);
  if (!m || m.index == null) return "";
  const rest = md.slice(m.index + m[0].length);
  const next = rest.search(/^##\s+/m);
  return next === -1 ? rest : rest.slice(0, next);
}

function parseKeyTakeaways(md: string): string[] {
  return sectionBody(md, "key takeaways")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^([-*]|\d+\.)\s+/.test(l))
    .map((l) => l.replace(/^([-*]|\d+\.)\s+/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);
}

function parseFaqs(md: string): Faq[] {
  const body = sectionBody(md, "(frequently asked questions|faqs?|q\\s*&\\s*a)");
  return body
    .split(/^###\s+/m)
    .slice(1)
    .map((part) => {
      const nl = part.indexOf("\n");
      const question = (nl === -1 ? part : part.slice(0, nl)).trim();
      const answer = (nl === -1 ? "" : part.slice(nl + 1)).trim().replace(/\s*\n\s*/g, " ");
      return { question, answer };
    })
    .filter((f) => f.question && f.answer);
}

export async function writeArticle(
  topic: TopicSelection,
  seo: SeoAnalysis,
  brief: ResearchBrief,
  ctx: AgentContext
): Promise<GeneratedArticle> {
  ctx.logger.forStep("content-writer").info(`Writing article: "${topic.workingTitle}"`);

  const outlineText = brief.outline
    .map((s) => `## ${s.h2}\n${s.h3.map((h) => `   ### ${h}`).join("\n")}`)
    .join("\n");

  const user = `Write the complete article now, in Markdown.

TOPIC: ${topic.workingTitle}
ANGLE: ${topic.angle}
CATEGORY: ${CATEGORY_NAME_BY_SLUG[topic.category] || topic.category}
SEARCH INTENT: ${seo.searchIntent} — ${topic.searchIntent}
PRIMARY KEYWORD: ${seo.primaryKeyword}
SECONDARY KEYWORDS: ${seo.secondaryKeywords.join(", ")}

KEY POINTS TO COVER:
${brief.keyPoints.map((p) => `- ${p}`).join("\n")}

FACTS / EXAMPLES:
${brief.facts.map((f) => `- ${f}`).join("\n")}

STATISTICS:
${brief.statistics.map((s) => `- ${s}`).join("\n")}

SUGGESTED OUTLINE (improve as needed):
${outlineText}

FAQ QUESTIONS TO ANSWER (as "### " headings under the FAQ section):
${brief.faqQuestions.map((q) => `- ${q}`).join("\n")}

Remember: ${WORD_RANGE.min}–${WORD_RANGE.max} words, Markdown only, no JSON, no code fences.`;

  const raw = await callText({
    system: SYSTEM,
    user,
    model: MODELS.writer,
    maxTokens: 20000,
    logger: ctx.logger,
    label: "content-writer",
  });

  // Strip any stray code fences / preamble.
  const content = raw
    .replace(/^```(?:markdown)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const title = (seo.titleIdeas?.[0] || topic.workingTitle).replace(/^#+\s*/, "").replace(/["#]/g, "").trim();

  const article: GeneratedArticle = {
    title,
    content,
    excerpt: makeExcerpt(content),
    keyTakeaways: parseKeyTakeaways(content),
    faqs: parseFaqs(content),
    wordCount: countWords(content),
  };

  ctx.logger.info(
    `Draft complete: ${article.wordCount} words, ${article.keyTakeaways.length} takeaways, ${article.faqs.length} FAQs`
  );
  return article;
}
