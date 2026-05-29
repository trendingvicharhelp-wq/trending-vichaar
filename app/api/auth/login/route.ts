import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ADMIN_COOKIE, COOKIE_OPTIONS, signAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      // Dev convenience: allow login with env-defined credentials
      const envEmail = process.env.ADMIN_EMAIL;
      const envPass = process.env.ADMIN_PASSWORD;
      if (!envEmail || !envPass) {
        return NextResponse.json(
          { error: "Database not configured. Set MONGODB_URI, or set ADMIN_EMAIL and ADMIN_PASSWORD for dev login." },
          { status: 503 }
        );
      }
      if (email !== envEmail || password !== envPass) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const token = await signAdminToken({
        sub: "env-admin",
        email: envEmail,
        name: process.env.ADMIN_NAME || "Admin",
        role: "admin",
      });
      const res = NextResponse.json({ ok: true });
      res.cookies.set(ADMIN_COOKIE, token, COOKIE_OPTIONS);
      return res;
    }

    await connectDB();
    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAdminToken({
      sub: String(user._id),
      email: user.email,
      name: user.name,
      role: "admin",
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
