import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAdminFromRequest } from "@/lib/auth";
import { calcReadingTime, makeExcerpt } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  await connectDB();
  const url = new URL(req.url);
  const limit = Math.min(50, Number(url.searchParams.get("limit")) || 12);
  const category = url.searchParams.get("category") || undefined;
  const search = url.searchParams.get("q") || undefined;

  const query: Record<string, any> = { status: "published" };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const posts = await Post.find(query).sort({ publishedAt: -1 }).limit(limit).lean();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "MongoDB is required to create posts. Set MONGODB_URI in .env.local." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    await connectDB();
    const slug =
      body.slug?.trim() ||
      slugify(body.title, { lower: true, strict: true, trim: true });

    const existing = await Post.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }

    const status = body.status || "draft";
    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    const publishedAt =
      status === "published"
        ? new Date()
        : status === "scheduled" && scheduledFor
        ? null
        : null;

    const post = await Post.create({
      title: body.title,
      slug,
      excerpt: body.excerpt || makeExcerpt(body.content),
      content: body.content,
      coverImage: body.coverImage || "",
      category: body.category || "ai-tools",
      tags: body.tags || [],
      featured: !!body.featured,
      status,
      scheduledFor,
      publishedAt,
      readingTime: calcReadingTime(body.content),
      author: {
        name: admin.name,
        avatar: undefined,
      },
      seo: body.seo || {},
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: any) {
    console.error("[posts POST]", err);
    return NextResponse.json({ error: err.message || "Create failed" }, { status: 500 });
  }
}
