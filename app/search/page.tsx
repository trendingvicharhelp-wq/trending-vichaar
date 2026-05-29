import type { Metadata } from "next";
import { listPosts } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { EmptyState } from "@/components/blog/EmptyState";
import { SearchInput } from "@/components/search/SearchInput";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Trending Vichaar for articles, tools and topics.",
};

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = (searchParams.q || "").trim();
  const posts = q ? await listPosts({ search: q, limit: 30 }) : [];

  return (
    <>
      <section className="border-b border-border">
        <div className="container py-20 lg:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Search</p>
          <h1 className="mt-6 max-w-3xl font-serif text-display-xl text-balance">
            Find a story.
            <br />
            <span className="italic text-accent">Or stumble onto one.</span>
          </h1>

          <div className="mt-10 max-w-2xl">
            <SearchInput defaultValue={q} />
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-24">
        {!q ? (
          <p className="text-center text-muted">
            Try searching for "ai", "design", "notion" or any topic that
            interests you.
          </p>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No results found"
            description={`We couldn't find anything matching "${q}". Try a different keyword.`}
          />
        ) : (
          <>
            <p className="mb-10 text-sm text-muted">
              {posts.length} result{posts.length === 1 ? "" : "s"} for{" "}
              <span className="text-foreground">"{q}"</span>
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <PostCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
