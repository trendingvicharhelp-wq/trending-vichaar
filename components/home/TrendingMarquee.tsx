import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { PostListItem } from "@/lib/posts";

export function TrendingMarquee({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) return null;
  const items = [...posts, ...posts];
  return (
    <section className="border-b border-border bg-foreground py-4 text-background">
      <div className="pause-on-hover relative overflow-hidden gradient-mask-r">
        <div className="marquee-track">
          {items.map((p, i) => (
            <Link
              key={`${p.slug}-${i}`}
              href={`/blog/${p.slug}`}
              className="inline-flex items-center gap-3 text-sm transition-opacity hover:opacity-75"
            >
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-[11px] uppercase tracking-[0.22em] opacity-60">
                Trending now
              </span>
              <span className="font-serif text-base">{p.title}</span>
              <span className="mx-4 opacity-30">·</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
