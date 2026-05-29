import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ comments: [] });
  }

  try {
    await connectDB();
    const comments = await Comment.find({ postSlug: slug, approved: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("_id name content createdAt")
      .lean();
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("[comments GET]", err);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postSlug, name, email, content } = body;
    if (!postSlug || !name || !email || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          comment: {
            _id: `local-${Date.now()}`,
            name,
            content,
            createdAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    }

    await connectDB();
    const c = await Comment.create({ postSlug, name, email, content });
    return NextResponse.json(
      {
        comment: {
          _id: c._id,
          name: c.name,
          content: c.content,
          createdAt: c.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[comments POST]", err);
    return NextResponse.json({ error: err.message || "Comment failed" }, { status: 500 });
  }
}
