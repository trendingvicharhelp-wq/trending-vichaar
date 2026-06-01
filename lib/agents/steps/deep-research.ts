/**
 * STEP 6 — Deep Research Agent.
 *
 * Runs deep, multi-source web research on the chosen topic and its primary /
 * secondary keywords, then distills everything into a structured ResearchBrief
 * the writer can build from: key points, concrete facts, real statistics, a
 * proposed H2/H3 outline, and reader FAQs.
 *
 * Uses the research model with the server-side web_search tool, then extracts
 * a JSON object from the model's prose (callWithWebSearch can't constrain
 * output to a schema, so we instruct the model to return ONLY JSON and parse).
 */

import { callWithWebSearch, extractJson } from "@/lib/agents/claude";
import { MODELS } from "@/lib/agents/config";
import { systemFor } from "@/lib/agents/prompts";
import type {
  AgentContext,
  OutlineSection,
  ResearchBrief,
  SeoAnalysis,
  TopicSelection,
} from "@/lib/agents/types";

const SYSTEM = systemFor(`You are the Deep Research Agent — a meticulous editorial researcher who gathers everything the writer needs to produce an authoritative, trustworthy article.

Use the web_search tool aggressively: run multiple, varied searches across the topic and its keywords, cross-check claims against several reputable sources, and prefer recent, credible publications over forums or low-quality content.

BRAND SAFETY — reassert before you research. You only research positive, helpful, EVERGREEN topics inside these 15 allowed categories: Artificial Intelligence, AI Tools, Technology, Software & Apps, Future Technology, Productivity, Graphic Design, Social Media Tips, Creator Economy, Digital Lifestyle, Internet Culture, Trending Consumer Products, Travel, Fashion, Skincare. NEVER research or surface news, current events, politics, government, crime, accidents, disasters, celebrity gossip, scandals, religion, financial/investment/trading advice, medical/health/mental-health advice, legal advice, adult/NSFW, gambling, weapons, or anything tied to a specific date or expiring event. If the topic drifts into a forbidden area, keep the research strictly on the safe, evergreen angle.

Deliver a research brief with:
- keyPoints: 6–9 substantive findings to weave into the article.
- facts: several concrete facts, examples, or mini case-studies.
- statistics: real statistics with loose source attribution inside each string (e.g. "~70% of ... (according to Source, 2025)"). Do not fabricate precise numbers — keep attribution honest and approximate.
- outline: 4–7 H2 sections, each with 1–3 H3 subsections, logically ordered for the reader.
- faqQuestions: 4–6 genuine questions a reader would search for.`);

export async function deepResearch(
  topic: TopicSelection,
  seo: SeoAnalysis,
  ctx: AgentContext
): Promise<ResearchBrief> {
  ctx.logger.forStep("deep-research").info(`Researching: "${topic.workingTitle}" (kw: ${seo.primaryKeyword})`);

  const user = `Research this topic deeply, then return the brief.

TOPIC: ${topic.workingTitle}
ANGLE: ${topic.angle}
SEARCH INTENT: ${seo.searchIntent} — ${topic.searchIntent}
PRIMARY KEYWORD: ${seo.primaryKeyword}
SECONDARY KEYWORDS: ${seo.secondaryKeywords.join(", ") || "(none)"}

Run several web searches, verify across multiple credible sources, then synthesize.

Return ONLY a JSON object (no prose, no code fence) with this exact shape:
{
  "keyPoints": ["6–9 substantive findings", "..."],
  "facts": ["concrete facts / examples / mini-case-studies", "..."],
  "statistics": ["real stat with loose attribution in the string", "..."],
  "outline": [{ "h2": "section heading", "h3": ["1–3 subsections"] }],
  "faqQuestions": ["4–6 reader questions", "..."]
}`;

  const raw = await callWithWebSearch({
    system: SYSTEM,
    user,
    model: MODELS.research,
    maxTokens: 3000,
    logger: ctx.logger,
    label: "deep-research",
  });

  const parsed = extractJson<Partial<ResearchBrief>>(raw);

  // Defensive defaults: every array field must be an array, and each outline
  // section must have a string h2 plus a string[] of h3s.
  const outline: OutlineSection[] = Array.isArray(parsed.outline)
    ? parsed.outline.map((s) => ({
        h2: s?.h2 ?? "",
        h3: Array.isArray(s?.h3) ? s.h3 : [],
      }))
    : [];

  const brief: ResearchBrief = {
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    facts: Array.isArray(parsed.facts) ? parsed.facts : [],
    statistics: Array.isArray(parsed.statistics) ? parsed.statistics : [],
    outline,
    faqQuestions: Array.isArray(parsed.faqQuestions) ? parsed.faqQuestions : [],
  };

  ctx.logger.info(
    `Research brief: ${brief.keyPoints.length} key points, ${brief.statistics.length} stats, ` +
      `${brief.outline.length} H2 sections, ${brief.faqQuestions.length} FAQs`
  );
  return brief;
}
