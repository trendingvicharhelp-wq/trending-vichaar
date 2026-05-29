import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { getSamplePosts } from "@/lib/sample-data";

interface Props {
  params: { slug: string };
}

async function loadPost(slug: string) {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const doc = await Post.findOne({ slug }).lean();
      if (doc) return JSON.parse(JSON.stringify(doc));
    } catch {}
  }
  const fallback = getSamplePosts().find((p) => p.slug === slug);
  return fallback ? JSON.parse(JSON.stringify(fallback)) : null;
}

export default async function EditPostPage({ params }: Props) {
  const post = await loadPost(params.slug);
  if (!post) notFound();

  return (
    <PostEditor
      mode="edit"
      postSlug={params.slug}
      initial={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        category: post.category,
        tags: (post.tags || []).join(", "),
        featured: post.featured,
        status: post.status,
        scheduledFor: post.scheduledFor
          ? new Date(post.scheduledFor).toISOString().slice(0, 16)
          : "",
        seoTitle: post.seo?.title || "",
        seoDescription: post.seo?.description || "",
        seoKeywords: (post.seo?.keywords || []).join(", "),
        ogImage: post.seo?.ogImage || "",
      }}
    />
  );
}
