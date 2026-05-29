import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, topic, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Please fill all required fields" }, { status: 400 });
    }
    // In production, forward to an email service (Resend, Postmark, etc.)
    console.log("[contact]", { name, email, topic, message });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[contact]", err);
    return NextResponse.json({ error: err.message || "Send failed" }, { status: 500 });
  }
}
