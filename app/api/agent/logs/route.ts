import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AgentRun } from "@/models/AgentRun";
import { isAuthorized } from "@/lib/agents/trigger-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Recent pipeline runs (publishing log). Protected by the agent secret. */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const limit = Math.min(100, Number(new URL(req.url).searchParams.get("limit")) || 20);
  await connectDB();
  const runs = await AgentRun.find({}, "-log")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ count: runs.length, runs });
}
