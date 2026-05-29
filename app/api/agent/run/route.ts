import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/agents/orchestrator";
import { isAuthorized } from "@/lib/agents/trigger-auth";

// Mongoose needs the Node.js runtime; the run is long, so request a long ceiling.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Trigger one pipeline run.
 *   - Vercel Cron calls this on a schedule (GET + Authorization: Bearer CRON_SECRET).
 *   - Manual/programmatic callers can POST with the secret.
 *   - Append ?dryRun=1 to run without publishing.
 */
async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Configure AGENT_TRIGGER_SECRET (or CRON_SECRET) and supply it." },
      { status: 401 }
    );
  }

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const trigger: "cron" | "api" = req.headers.get("x-vercel-cron") ? "cron" : "api";

  const res = await runPipeline({ trigger, dryRun });

  return NextResponse.json(
    {
      ok: res.ok,
      runId: res.runId,
      durationMs: res.durationMs,
      error: res.error ?? null,
      post: res.artifacts.publish ?? null,
      title: res.artifacts.article?.title ?? null,
      seoScore: res.artifacts.seoScore?.score ?? null,
      readability: res.artifacts.readability ?? null,
    },
    { status: res.ok ? 200 : 500 }
  );
}

export const GET = handle;
export const POST = handle;
