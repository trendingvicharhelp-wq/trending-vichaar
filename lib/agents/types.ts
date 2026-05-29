/**
 * Shared payload contracts for the content pipeline.
 *
 * Each of the nine agents consumes a typed input and returns a typed output.
 * The orchestrator wires them together. Keep these stable — they are the
 * integration contract between the agents.
 */

import type { Logger } from "@/lib/agents/logger";

/** Context threaded through every agent step. */
export interface AgentContext {
  /** Unique id for this pipeline run (also the AgentRun document id). */
  runId: string;
  logger: Logger;
  /** "Now" for the run, so timestamps are consistent across steps. */
  now: Date;
  /**
   * When true, the pipeline runs end-to-end but the Publisher does NOT write
   * to the database (used for testing without persisting).
   */
  dryRun: boolean;
}

/* ------------------------------------------------------------------ *
 * STEP 1 — Trend Research
 * ------------------------------------------------------------------ */

export interface TrendCandidate {
  /** Short topic phrase, e.g. "AI note-taking apps for students". */
  topic: string;
  /** Why this is trending / interesting to the audience right now. */
  why: string;
  /** Best-fit category slug (from ALLOWED_CATEGORIES). */
  suggestedCategory: string;
  /** 0–100: how much 20–35 year-olds are searching / discussing this. */
  searchDemand: number;
  /** 0–100: how evergreen (long-lived) the topic is. */
  evergreenScore: number;
  /** Where the signal came from (publication names / sites). */
  sources: string[];
}

export interface TrendResearchResult {
  candidates: TrendCandidate[];
}

/* ------------------------------------------------------------------ *
 * STEP 2 — Topic Selection
 * ------------------------------------------------------------------ */

export interface TopicSelection {
  /** Working title / headline for the chosen topic. */
  workingTitle: string;
  /** The specific angle that makes it worth reading. */
  angle: string;
  /** Chosen category slug (must be an ALLOWED_CATEGORIES slug). */
  category: string;
  /** Why this topic beat the others. */
  rationale: string;
  /** What the reader is trying to accomplish (search intent). */
  searchIntent: string;
  /** True only if every brand-safety check passed. */
  brandSafe: boolean;
}

/* ------------------------------------------------------------------ *
 * STEP 3 — SEO Analysis
 * ------------------------------------------------------------------ */

export interface SeoAnalysis {
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: "informational" | "commercial" | "navigational" | "transactional";
  /** 0–100 estimated ranking difficulty. */
  difficulty: number;
  /** 0–100 overall SEO opportunity. */
  opportunityScore: number;
  /** SEO-friendly URL slug suggestion (lowercase, hyphenated). */
  recommendedSlug: string;
  /** A few headline options optimised for clicks + the keyword. */
  titleIdeas: string[];
}

/* ------------------------------------------------------------------ *
 * STEP 4 — Deep Research
 * ------------------------------------------------------------------ */

export interface OutlineSection {
  h2: string;
  h3: string[];
}

export interface ResearchBrief {
  /** Bullet-point key findings to weave into the article. */
  keyPoints: string[];
  /** Concrete facts / examples / mini-case-studies. */
  facts: string[];
  /** Notable statistics (with rough source attribution in the string). */
  statistics: string[];
  /** Proposed H2/H3 structure for the writer. */
  outline: OutlineSection[];
  /** Reader questions worth answering as FAQs. */
  faqQuestions: string[];
}

/* ------------------------------------------------------------------ *
 * STEP 5 — Content Writer
 * ------------------------------------------------------------------ */

export interface Faq {
  question: string;
  answer: string;
}

export interface GeneratedArticle {
  /** Final on-page H1 / post title. */
  title: string;
  /**
   * Full article body as GitHub-flavoured Markdown. Uses `##`/`###` headings
   * (NO top-level `#` — the title is rendered separately). Includes the intro,
   * H2/H3 body, a "Key Takeaways" section, an "FAQs" section, and a
   * "Conclusion" section.
   */
  content: string;
  /** Short reader-friendly summary (used as the excerpt fallback). */
  excerpt: string;
  /** Bulleted key takeaways (also embedded in `content`). */
  keyTakeaways: string[];
  /** Structured FAQs (also embedded in `content`). */
  faqs: Faq[];
  /** Computed word count of `content`. */
  wordCount: number;
}

/* ------------------------------------------------------------------ *
 * STEP 6 — SEO Optimizer
 * ------------------------------------------------------------------ */

export interface InternalLinkSuggestion {
  /** Anchor text to use. */
  anchor: string;
  /** Topic / target the link should point to. */
  targetTopic: string;
}

export interface SeoPackage {
  /** On-page SEO title (<= 60 chars ideally). */
  seoTitle: string;
  /** <title> / og:title meta title. */
  metaTitle: string;
  /** Meta description (<= 160 chars). */
  metaDescription: string;
  /** Final URL slug. */
  slug: string;
  /** Exactly 10 SEO keywords. */
  keywords: string[];
  /** 5 internal-linking suggestions. */
  internalLinks: InternalLinkSuggestion[];
  /** 3 category suggestions (slugs from ALLOWED_CATEGORIES). */
  categorySuggestions: string[];
  /** Post tags (3–8). */
  tags: string[];
  /** Ready-to-post social caption. */
  socialCaption: string;
  /** Pinterest pin title. */
  pinterestTitle: string;
  /** Pinterest pin description. */
  pinterestDescription: string;
}

/* ------------------------------------------------------------------ *
 * STEP 7 — Image Prompt Generator
 * ------------------------------------------------------------------ */

export interface ImagePromptResult {
  /** Detailed prompt for an AI image generator. */
  featuredImagePrompt: string;
  /** Accessible alt text for the featured image. */
  altText: string;
  /** Short style descriptor (e.g. "editorial 3D render, warm tones"). */
  style: string;
}

/* ------------------------------------------------------------------ *
 * Scoring (computed locally, not via the model)
 * ------------------------------------------------------------------ */

export interface SeoScore {
  /** 0–100 composite SEO score. */
  score: number;
  /** Human-readable check results. */
  checks: { label: string; passed: boolean; detail?: string }[];
}

export interface ReadabilityScore {
  /** Flesch Reading Ease (0–100, higher = easier). */
  fleschReadingEase: number;
  /** Flesch–Kincaid grade level. */
  gradeLevel: number;
  /** Rough label, e.g. "easy". */
  label: string;
}

/* ------------------------------------------------------------------ *
 * STEP 8 — Publisher
 * ------------------------------------------------------------------ */

export interface PublishResult {
  /** Mongo _id of the created post (null on dry run). */
  postId: string | null;
  slug: string;
  url: string;
  status: "published" | "skipped-dry-run";
}

/* ------------------------------------------------------------------ *
 * Pipeline accumulator (assembled by the orchestrator)
 * ------------------------------------------------------------------ */

export interface PipelineArtifacts {
  trends?: TrendResearchResult;
  topic?: TopicSelection;
  seoAnalysis?: SeoAnalysis;
  brief?: ResearchBrief;
  article?: GeneratedArticle;
  seoPackage?: SeoPackage;
  image?: ImagePromptResult;
  seoScore?: SeoScore;
  readability?: ReadabilityScore;
  publish?: PublishResult;
}

export interface PipelineResult {
  runId: string;
  ok: boolean;
  durationMs: number;
  error?: string;
  artifacts: PipelineArtifacts;
}
