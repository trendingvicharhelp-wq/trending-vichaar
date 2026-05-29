/**
 * STEP 5 — Content Writer Agent.
 *
 * Turns the research brief into a complete, human-sounding, SEO-optimised
 * article in Markdown. This is the quality-critical step, so it runs on the
 * writer model (Opus by default) and streams to allow a long output.
 *
 * Output is structured JSON containing both the full Markdown body and the
 * broken-out pieces (takeaways, FAQs) the optimizer and publisher reuse.
 */

import { callStructured } from "@/lib/agents/claude";
import { MODELS, WORD_RANGE, CATEGORY_NAME_BY_SLUG } from "@/lib/agents/config";
import { HUMAN_VOICE_RULES, systemFor } from "@/lib/agents/prompts";
import { wordCount as countWords } from "@/lib/agents/scoring";
import type {
  AgentContext,
  GeneratedArticle,
  ResearchBrief,
  SeoAnalysis,
  TopicSelection,
} from "@/lib/agents/types";

const SYSTEM = systemFor(`You are the Content Writer — a senior human blogger who writes the kind of post people bookmark and share.

${HUMAN_VOICE_RULES}

You write the FULL article as GitHub-flavoured Markdown with this structure:
1. A hook introduction (2–3 short paragraphs, NO heading) that earns the next scroll.
2. The main body using "##" for H2 sections and "###" for H3 subsections (follow the provided outline, improve it where useful).
3. A "## Key Takeaways" section with 4–6 bullet points.
4. A "## Frequently Asked Questions" section with each question as a "###" and a 2–4 sentence answer.
5. A "## Conclusion" section that lands the point and gently invites the reader to act.

Rules:
- Do NOT use a top-level "#" heading (the title is rendered separately).
- Length: ${WORD_RANGE.min}–${WORD_RANGE.max} words. Be substantive but never padded.
- Weave the primary keyword in naturally (title-ish phrasing in the first 100 words, a couple of H2s, the conclusion) — never keyword-stuff.
- Use the research facts and statistics; attribute loosely in prose ("according to ...") without fabricating exact citations.`);

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

  const user = `Write the complete article now.

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

FAQ QUESTIONS TO ANSWER:
${brief.faqQuestions.map((q) => `- ${q}`).join("\n")}

Return ONLY a JSON object (no prose, no code fence) with this exact shape:
{
  "title": "final post title (60 chars or less, compelling, includes the keyword idea)",
  "content": "the FULL article as Markdown following the required structure",
  "excerpt": "a 1–2 sentence summary (max 180 chars)",
  "keyTakeaways": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

  // Structured-output mode guarantees valid JSON escaping for the long Markdown
  // body; thinkingBudget:0 hands the full token budget to the article.
  const SCHEMA: Record<string, unknown> = {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      excerpt: { type: "string" },
      keyTakeaways: { type: "array", items: { type: "string" } },
      faqs: {
        type: "array",
        items: {
          type: "object",
          properties: { question: { type: "string" }, answer: { type: "string" } },
          required: ["question", "answer"],
        },
      },
    },
    required: ["title", "content", "excerpt", "keyTakeaways", "faqs"],
  };

  const parsed = await callStructured<Omit<GeneratedArticle, "wordCount">>({
    system: SYSTEM,
    user,
    model: MODELS.writer,
    schema: SCHEMA,
    maxTokens: 20000,
    thinkingBudget: 0,
    logger: ctx.logger,
    label: "content-writer",
  });
  const article: GeneratedArticle = {
    ...parsed,
    keyTakeaways: parsed.keyTakeaways || [],
    faqs: parsed.faqs || [],
    wordCount: countWords(parsed.content),
  };

  ctx.logger.info(`Draft complete: ${article.wordCount} words, ${article.faqs.length} FAQs`);
  return article;
}
