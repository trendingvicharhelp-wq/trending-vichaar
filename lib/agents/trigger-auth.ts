import { NextRequest } from "next/server";
import { TRIGGER_SECRET } from "@/lib/agents/config";

/**
 * Authorise a request to the agent endpoints. Accepts the shared secret via
 * `Authorization: Bearer <secret>` (used by Vercel Cron), an `x-agent-secret`
 * header, or a `?secret=` query param. Returns false when no secret is
 * configured, so the endpoints are closed by default.
 */
export function isAuthorized(req: NextRequest): boolean {
  const secret = TRIGGER_SECRET || process.env.CRON_SECRET || "";
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const header = req.headers.get("x-agent-secret");
  const query = new URL(req.url).searchParams.get("secret");

  return bearer === secret || header === secret || query === secret;
}
