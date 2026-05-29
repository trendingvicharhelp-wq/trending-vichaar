/**
 * Local (no-LLM) quality scoring for generated articles.
 *
 *  - readability(): Flesch Reading Ease + Flesch–Kincaid grade level.
 *  - seoScore():    a composite of concrete on-page SEO checks.
 *
 * These run after the writer/optimizer so the orchestrator can record scores
 * and, if desired, gate publishing on them.
 */

import { WORD_RANGE } from "@/lib/agents/config";
import type { GeneratedArticle, ReadabilityScore, SeoPackage, SeoScore } from "@/lib/agents/types";

/** Strip Markdown to roughly-plain prose for text statistics. */
function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function readability(markdown: string): ReadabilityScore {
  const text = toPlainText(markdown);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words.length);
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  const flesch = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  const ease = Math.max(0, Math.min(100, Math.round(flesch)));
  let label = "very difficult";
  if (ease >= 80) label = "very easy";
  else if (ease >= 70) label = "easy";
  else if (ease >= 60) label = "plain";
  else if (ease >= 50) label = "fairly difficult";
  else if (ease >= 30) label = "difficult";

  return {
    fleschReadingEase: ease,
    gradeLevel: Math.max(1, Math.round(grade * 10) / 10),
    label,
  };
}

/** Count words in a Markdown body. */
export function wordCount(markdown: string): number {
  return toPlainText(markdown).split(/\s+/).filter(Boolean).length;
}

export function seoScore(article: GeneratedArticle, seo: SeoPackage): SeoScore {
  const body = article.content.toLowerCase();
  const primary = (seo.keywords[0] || "").toLowerCase();
  const words = wordCount(article.content);
  const h2Count = (article.content.match(/^##\s+/gm) || []).length;
  const h3Count = (article.content.match(/^###\s+/gm) || []).length;

  const checks: SeoScore["checks"] = [
    {
      label: "Title length 30–65 chars",
      passed: seo.seoTitle.length >= 30 && seo.seoTitle.length <= 65,
      detail: `${seo.seoTitle.length} chars`,
    },
    {
      label: "Meta description 120–160 chars",
      passed: seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160,
      detail: `${seo.metaDescription.length} chars`,
    },
    {
      label: "Primary keyword in title",
      passed: !!primary && seo.seoTitle.toLowerCase().includes(primary),
    },
    {
      label: "Primary keyword in body",
      passed: !!primary && body.includes(primary),
    },
    {
      label: `Word count in range (${WORD_RANGE.min}–${WORD_RANGE.max})`,
      passed: words >= WORD_RANGE.min && words <= WORD_RANGE.max,
      detail: `${words} words`,
    },
    { label: "At least 3 H2 sections", passed: h2Count >= 3, detail: `${h2Count} H2` },
    { label: "Uses H3 subsections", passed: h3Count >= 1, detail: `${h3Count} H3` },
    { label: "Exactly 10 keywords", passed: seo.keywords.length === 10 },
    { label: "Has FAQs", passed: article.faqs.length >= 3, detail: `${article.faqs.length} FAQs` },
    { label: "Slug is clean", passed: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(seo.slug) },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}
