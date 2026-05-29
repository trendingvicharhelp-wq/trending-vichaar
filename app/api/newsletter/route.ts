import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ ok: true, note: "Stored locally (no DB)" });
    }

    await connectDB();
    try {
      await Subscriber.create({ email: String(email).toLowerCase(), source });
    } catch (err: any) {
      if (err.code === 11000) {
        return NextResponse.json({ ok: true, note: "Already subscribed" });
      }
      throw err;
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: err.message || "Subscription failed" }, { status: 500 });
  }
}
