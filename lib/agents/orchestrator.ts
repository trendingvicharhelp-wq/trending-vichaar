/**
 * The pipeline orchestrator — wires the nine agents together, handles
 * duplicate/repetition prevention, per-run logging, quality scoring, and
 * failure recording.
 *
 *   Trend Research → Topic Selection → SEO Analysis → Deep Research →
 *   Content Writer → SEO Optimizer → Image Prompt → Publisher → Analytics
 *
 * Individual Claude calls retry internally (see claude.ts withRetry); this
 * layer adds topic-level dedup retries and run-level bookkeeping.
 */

import { randomUUID } from "crypto";
import { connectDB } from "@/lib/db";
import { AgentRun } from "@/models/AgentRun";
import { TopicHistory } from "@/models/TopicHistory";
import { Logger } from "@/lib/agents/logger";
import { DUPLICATE_TITLE_THRESHOLD, TOPIC_HISTORY_WINDOW } from "@/lib/agents/config";
import { isDuplicate, jaccard, tokenizeTitle } from "@/lib/agents/dedup";
import { readability, seoScore } from "@/lib/agents/scoring";
import type { AgentContext, PipelineArtifacts, PipelineResult, TopicSelection } from "@/lib/agents/types";

import { trendResearch } from "@/lib/agents/steps/trend-research";
import { selectTopic } from "@/lib/agents/steps/topic-selection";
import { analyzeSeo } from "@/lib/agents/steps/seo-analysis";
import { deepResearch } from "@/lib/agents/steps/deep-research";
import { writeArticle } from "@/lib/agents/steps/content-writer";
import { optimizeSeo } from "@/lib/agents/steps/seo-optimizer";
import { generateImagePrompt } from "@/lib/agents/steps/image-prompt";
import { publish } from "@/lib/agents/steps/publisher";
import { trackAnalytics } from "@/lib/agents/steps/analytics-tracker";

export interface RunOptions {
  trigger?: "cron" | "manual" | "api";
  /** Run the full pipeline but skip all DB writes. */
  dryRun?: boolean;
}

interface RecentTopic {
  title: string;
  tokens: string[];
}

async function loadRecentTopics(): Promise<RecentTopic[]> {
  try {
    await connectDB();
    const rows = await TopicHistory.find({}, "title titleTokens")
      .sort({ createdAt: -1 })
      .limit(TOPIC_HISTORY_WINDOW)
      .lean();
    return rows.map((r) => ({
      title: r.title,
      tokens: r.titleTokens?.length ? r.titleTokens : tokenizeTitle(r.title),
    }));
  } catch {
    return [];
  }
}

/** Select a topic that isn't a near-duplicate of anything published recently. */
async function selectUniqueTopic(
  trends: PipelineArtifacts["trends"],
  recent: RecentTopic[],
  ctx: AgentContext
): Promise<TopicSelection> {
  const avoid = recent.map((r) => r.title);
  const history = recent.map((r) => r.tokens);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const topic = await selectTopic(trends!, avoid, ctx);
    const tokens = tokenizeTitle(topic.workingTitle);
    if (!isDuplicate(tokens, history, DUPLICATE_TITLE_THRESHOLD)) return topic;

    const worst = recent
      .map((r) => ({ t: r.title, s: jaccard(tokens, r.tokens) }))
      .sort((a, b) => b.s - a.s)[0];
    ctx.logger.warn(
      `Topic "${topic.workingTitle}" too similar to "${worst?.t}" (${worst?.s.toFixed(
        2
      )}). Reselecting (attempt ${attempt}).`
    );
    avoid.push(topic.workingTitle);
  }
  // Give up gracefully — take the last selection rather than failing the run.
  ctx.logger.warn("Could not find a fully unique topic after 3 tries; proceeding with best effort.");
  return selectTopic(trends!, avoid, ctx);
}

export async function runPipeline(options: RunOptions = {}): Promise<PipelineResult> {
  const { trigger = "manual", dryRun = false } = options;
  const runId = randomUUID();
  const now = new Date();
  const startedAt = Date.now();
  const logger = new Logger(runId);
  const ctx: AgentContext = { runId, logger, now, dryRun };
  const artifacts: PipelineArtifacts = {};

  logger.info(`=== Pipeline start (trigger=${trigger}, dryRun=${dryRun}) ===`);

  if (!dryRun && !process.env.MONGODB_URI) {
    const msg = "MONGODB_URI is not set — cannot publish. Set it or run with dryRun=true.";
    logger.error(msg);
    return { runId, ok: false, durationMs: 0, error: msg, artifacts };
  }

  // Open the run record up front so a crash still leaves a trace.
  if (!dryRun) {
    try {
      await connectDB();
      await AgentRun.create({ runId, status: "running", trigger, dryRun, startedAt: now });
    } catch (err) {
      logger.warn(`Could not open AgentRun record: ${(err as Error).message}`);
    }
  }

  try {
    // 1. Trend research
    artifacts.trends = await trendResearch(ctx);
    logger.info(`Found ${artifacts.trends.candidates.length} trend candidates.`);

    // 2. Topic selection (with repetition prevention)
    const recent = await loadRecentTopics();
    artifacts.topic = await selectUniqueTopic(artifacts.trends, recent, ctx);
    logger.info(`Selected topic: "${artifacts.topic.workingTitle}" [${artifacts.topic.category}]`);

    // 3. SEO analysis
    artifacts.seoAnalysis = await analyzeSeo(artifacts.topic, ctx);
    logger.info(`Primary keyword: "${artifacts.seoAnalysis.primaryKeyword}".`);

    // 4. Deep research
    artifacts.brief = await deepResearch(artifacts.topic, artifacts.seoAnalysis, ctx);
    logger.info(`Brief: ${artifacts.brief.keyPoints.length} key points, ${artifacts.brief.outline.length} sections.`);

    // 5. Content writing
    artifacts.article = await writeArticle(
      artifacts.topic,
      artifacts.seoAnalysis,
      artifacts.brief,
      ctx
    );

    // 6. SEO optimisation + social copy
    artifacts.seoPackage = await optimizeSeo(
      artifacts.article,
      artifacts.topic,
      artifacts.seoAnalysis,
      ctx
    );

    // 7. Featured-image prompt
    artifacts.image = await generateImagePrompt(artifacts.article, artifacts.topic, ctx);

    // Quality scoring (local, no LLM)
    artifacts.seoScore = seoScore(artifacts.article, artifacts.seoPackage);
    artifacts.readability = readability(artifacts.article.content);
    logger.info(
      `Scores — SEO ${artifacts.seoScore.score}/100, readability ${artifacts.readability.fleschReadingEase} (${artifacts.readability.label}).`
    );

    // 8. Publish
    artifacts.publish = await publish(artifacts.article, artifacts.seoPackage, artifacts.image, ctx);

    // 9. Analytics / archive
    const durationMs = Date.now() - startedAt;
    await trackAnalytics(
      {
        topic: artifacts.topic,
        seoAnalysis: artifacts.seoAnalysis,
        article: artifacts.article,
        publish: artifacts.publish,
        seoScore: artifacts.seoScore,
        readability: artifacts.readability,
        durationMs,
      },
      ctx
    );

    logger.info(`=== Pipeline success in ${(durationMs / 1000).toFixed(1)}s → ${artifacts.publish.url} ===`);
    return { runId, ok: true, durationMs, artifacts };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Pipeline failed: ${message}`);
    if (!dryRun) {
      try {
        await connectDB();
        await AgentRun.updateOne(
          { runId },
          {
            $set: {
              status: "failed",
              error: message,
              durationMs,
              finishedAt: new Date(),
              topic: artifacts.topic?.workingTitle,
              category: artifacts.topic?.category,
              log: logger.entries,
            },
          },
          { upsert: true }
        );
      } catch (e) {
        logger.error(`Also failed to record failure: ${(e as Error).message}`);
      }
    }
    return { runId, ok: false, durationMs, error: message, artifacts };
  }
}
