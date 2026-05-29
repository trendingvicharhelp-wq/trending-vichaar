import { PostCard } from "@/components/blog/PostCard";
import type { PostListItem } from "@/lib/posts";

export function RelatedPosts({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="border-t border-border bg-surface/40 py-20 lg:py-28">
      <div className="container">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Keep reading
        </p>
        <h2 className="mt-3 font-serif text-display-lg text-balance">
          Stories you might like next
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.slug} post={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
