import "@/lib/agents/load-env"; // MUST be first — loads .env.local before DB module
/* eslint-disable no-console */
/**
 * Runner for the content agent.
 *
 *   npm run agent                 # publish ONE post
 *   npm run agent -- --max=5      # publish up to 5, stopping when quota runs out
 *   npm run agent:dry             # full pipeline, no DB writes
 *
 * In batch mode it keeps publishing until it reaches --max OR hits the daily
 * free-tier quota (then it stops gracefully — partial success is still success).
 * TopicHistory dedup guarantees each post in the batch is a different topic.
 *
 * Requires GEMINI_API_KEY (and MONGODB_URI unless --dry-run).
 */
import { runPipeline } from "@/lib/agents/orchestrator";

const dryRun = process.argv.includes("--dry-run") || process.argv.includes("-d");
const maxArg = process.argv.find((a) => a.startsWith("--max="));
const max = Math.max(1, (maxArg && parseInt(maxArg.split("=")[1], 10)) || 1);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isQuota = (e = "") => /RESOURCE_EXHAUSTED|quota|rate.?limit|\b429\b/i.test(e);

(async () => {
  let published = 0;
  for (let i = 1; i <= max; i++) {
    if (max > 1) console.log(`\n----- Post ${i}/${max} -----`);
    const res = await runPipeline({ trigger: "manual", dryRun });

    if (res.ok) {
      published++;
      console.log(`✓ Published: "${res.artifacts.article?.title}" → ${res.artifacts.publish?.url || "(dry run)"}`);
    } else if (isQuota(res.error)) {
      console.log(`Daily free quota reached — stopping after ${published} post(s).`);
      break;
    } else {
      console.log(`Run failed (non-quota): ${res.error}`);
      break;
    }
    if (i < max) await sleep(20000); // space out calls to respect per-minute limits
  }

  console.log(`\n=== Batch complete: ${published} post(s) published ===`);
  process.exit(published > 0 || dryRun ? 0 : 1);
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
