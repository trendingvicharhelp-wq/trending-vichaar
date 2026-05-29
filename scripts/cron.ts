/* eslint-disable no-console */
/**
 * Self-hosted scheduler — keeps a long-running process that fires the content
 * pipeline daily at 21:00 IST (configurable via AGENT_CRON / Asia/Kolkata).
 *
 *   npm run agent:cron
 *
 * Use this on a VPS / always-on box / Docker container. On Vercel, prefer the
 * platform cron in vercel.json hitting /api/agent/run instead.
 */
import "@/lib/agents/load-env"; // MUST be first — loads .env.local before DB module
import cron from "node-cron";
import { SCHEDULE } from "@/lib/agents/config";
import { runPipeline } from "@/lib/agents/orchestrator";

if (!cron.validate(SCHEDULE.cron)) {
  console.error(`[cron] invalid cron expression: "${SCHEDULE.cron}"`);
  process.exit(1);
}

console.log(`[cron] Trending Vichaar content agent scheduled at "${SCHEDULE.cron}" (${SCHEDULE.timezone}). Waiting…`);

cron.schedule(
  SCHEDULE.cron,
  async () => {
    console.log(`[cron] Triggered at ${new Date().toISOString()}`);
    try {
      const res = await runPipeline({ trigger: "cron" });
      console.log(`[cron] Finished ok=${res.ok} ${res.artifacts.publish?.url ?? res.error ?? ""}`);
    } catch (err) {
      console.error("[cron] Unhandled error:", err);
    }
  },
  { timezone: SCHEDULE.timezone }
);

// Keep the process alive.
process.stdin.resume();
