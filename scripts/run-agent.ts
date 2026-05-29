/* eslint-disable no-console */
/**
 * Manual / one-off runner for the content agent.
 *
 *   npm run agent          # research, write, and PUBLISH one post
 *   npm run agent:dry      # full pipeline, but no database writes
 *
 * Requires GEMINI_API_KEY (and MONGODB_URI unless --dry-run).
 */
import "@/lib/agents/load-env"; // MUST be first — loads .env.local before DB module
import { runPipeline } from "@/lib/agents/orchestrator";

const dryRun = process.argv.includes("--dry-run") || process.argv.includes("-d");

runPipeline({ trigger: "manual", dryRun })
  .then((res) => {
    console.log("\n=== RESULT ===");
    console.log(
      JSON.stringify(
        {
          ok: res.ok,
          runId: res.runId,
          durationMs: res.durationMs,
          error: res.error ?? null,
          title: res.artifacts.article?.title ?? null,
          url: res.artifacts.publish?.url ?? null,
          category: res.artifacts.topic?.category ?? null,
          words: res.artifacts.article?.wordCount ?? null,
          seoScore: res.artifacts.seoScore?.score ?? null,
          readability: res.artifacts.readability ?? null,
        },
        null,
        2
      )
    );
    process.exit(res.ok ? 0 : 1);
  })
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
