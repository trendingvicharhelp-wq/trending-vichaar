/**
 * STEP 9 — Analytics Tracker Agent.
 *
 * Closes out the run: records the topic in TopicHistory (so future runs don't
 * repeat it) and finalises the AgentRun document with the publish result,
 * quality scores, duration, and full log transcript.
 *
 * Writes are best-effort: a tracking failure must never crash a run that has
 * already published successfully.
 */

import { connectDB } from "@/lib/db";
import { TopicHistory } from "@/models/TopicHistory";
import { AgentRun } from "@/models/AgentRun";
import { tokenizeTitle } from "@/lib/agents/dedup";
import type {
  AgentContext,
  GeneratedArticle,
  PublishResult,
  ReadabilityScore,
  SeoAnalysis,
  SeoScore,
  TopicSelection,
} from "@/lib/agents/types";

export interface TrackInput {
  topic: TopicSelection;
  seoAnalysis: SeoAnalysis;
  article: GeneratedArticle;
  publish: PublishResult;
  seoScore: SeoScore;
  readability: ReadabilityScore;
  durationMs: number;
}

export async function trackAnalytics(input: TrackInput, ctx: AgentContext): Promise<void> {
  const log = ctx.logger.forStep("analytics-tracker");

  if (ctx.dryRun) {
    log.warn("Dry run — skipping TopicHistory / AgentRun persistence.");
    return;
  }

  try {
    await connectDB();

    await TopicHistory.create({
      title: input.article.title,
      slug: input.publish.slug,
      category: input.topic.category,
      primaryKeyword: input.seoAnalysis.primaryKeyword,
      titleTokens: tokenizeTitle(input.article.title),
      runId: ctx.runId,
    });

    await AgentRun.updateOne(
      { runId: ctx.runId },
      {
        $set: {
          status: "success",
          topic: input.article.title,
          category: input.topic.category,
          primaryKeyword: input.seoAnalysis.primaryKeyword,
          postId: input.publish.postId,
          slug: input.publish.slug,
          url: input.publish.url,
          wordCount: input.article.wordCount,
          seoScore: input.seoScore.score,
          readabilityScore: input.readability.fleschReadingEase,
          readabilityLabel: input.readability.label,
          durationMs: input.durationMs,
          finishedAt: ctx.now,
          log: ctx.logger.entries,
        },
      },
      { upsert: true }
    );

    log.info(
      `Run recorded. SEO ${input.seoScore.score}/100, readability ${input.readability.fleschReadingEase} (${input.readability.label}).`
    );
  } catch (err) {
    log.error(`Analytics persistence failed (non-fatal): ${(err as Error).message}`);
  }
}
