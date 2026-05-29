import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";
import type { PostListItem } from "@/lib/posts";

export function LatestGrid({ posts }: { posts: PostListItem[] }) {
  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Just published"
          title="Latest from the magazine"
          description="A fresh batch of pieces, sorted by what dropped most recently."
          href="/blog"
          hrefLabel="Visit blog"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.slug} post={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
