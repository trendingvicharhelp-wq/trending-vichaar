import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAdminFromRequest } from "@/lib/auth";
import { calcReadingTime, makeExcerpt } from "@/lib/utils";

interface Ctx { params: { slug: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  await connectDB();
  const post = await Post.findOne({ slug: params.slug }).lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    await connectDB();
    const post = await Post.findOne({ slug: params.slug });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const wasPublished = post.status === "published";
    const nextStatus = body.status || post.status;

    post.title = body.title ?? post.title;
    post.excerpt = body.excerpt || makeExcerpt(body.content ?? post.content);
    post.content = body.content ?? post.content;
    post.coverImage = body.coverImage ?? post.coverImage;
    post.category = body.category ?? post.category;
    post.tags = body.tags ?? post.tags;
    post.featured = body.featured ?? post.featured;
    post.status = nextStatus;
    post.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    post.readingTime = calcReadingTime(post.content);
    post.seo = { ...post.seo, ...(body.seo || {}) };

    if (body.slug && body.slug !== post.slug) {
      post.slug = body.slug;
    }

    if (nextStatus === "published" && !wasPublished) {
      post.publishedAt = new Date();
    } else if (nextStatus === "scheduled" && post.scheduledFor) {
      post.publishedAt = null;
    } else if (nextStatus === "draft") {
      post.publishedAt = null;
    }

    await post.save();
    return NextResponse.json({ post });
  } catch (err: any) {
    console.error("[posts PUT]", err);
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  await connectDB();
  const result = await Post.deleteOne({ slug: params.slug });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
