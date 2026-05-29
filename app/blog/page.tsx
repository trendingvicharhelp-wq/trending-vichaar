import type { Metadata } from "next";
import { listPosts, countPosts } from "@/lib/posts";
import { CATEGORY_LIST } from "@/lib/utils";
import { PostCard } from "@/components/blog/PostCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { Pagination } from "@/components/blog/Pagination";
import { EmptyState } from "@/components/blog/EmptyState";

export const revalidate = 60;

interface PageProps {
  searchParams: {
    category?: string;
    page?: string;
    q?: string;
    sort?: "latest" | "trending" | "popular";
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const cat = CATEGORY_LIST.find((c) => c.slug === searchParams.category);
  const title = cat ? `${cat.name} — Blog` : "Blog";
  return {
    title,
    description: cat
      ? `Latest articles on ${cat.name} from Trending Vichaar.`
      : "Read the latest articles from Trending Vichaar — AI, design, social media and more.",
  };
}

const PAGE_SIZE = 9;

export default async function BlogIndex({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const sort = (searchParams.sort as any) || "latest";
  const [posts, total] = await Promise.all([
    listPosts({
      category: searchParams.category,
      search: searchParams.q,
      sort,
      limit: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    countPosts({ category: searchParams.category, search: searchParams.q }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const cat = CATEGORY_LIST.find((c) => c.slug === searchParams.category);

  return (
    <>
      <section className="border-b border-border">
        <div className="container py-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            The Vichaar Blog
          </p>
          <h1 className="mt-4 font-serif text-display-xl text-balance">
            {cat ? `${cat.emoji} ${cat.name}` : "Every story, one shelf."}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted">
            {cat
              ? `Hand-picked stories from the ${cat.name} desk. Fresh pieces, updated weekly.`
              : "A working archive of pieces on AI, design, social media and the trends shaping the digital world. Filter, sort, or just keep scrolling."}
          </p>
        </div>
      </section>

      <section className="container py-10 lg:py-14">
        <div className="flex flex-col gap-6">
          <CategoryFilter />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {total} {total === 1 ? "story" : "stories"}
              {searchParams.q && ` matching "${searchParams.q}"`}
            </p>
            <SortDropdown current={sort} />
          </div>
        </div>

        <div className="mt-10">
          {posts.length === 0 ? (
            <EmptyState
              title="No posts match"
              description="Try a different category or clear your filters."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <PostCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-16">
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/blog"
            searchParams={{
              category: searchParams.category,
              q: searchParams.q,
              sort: searchParams.sort,
            }}
          />
        </div>
      </section>
    </>
  );
}

function SortDropdown({ current }: { current: string }) {
  const options = [
    { value: "latest", label: "Latest" },
    { value: "trending", label: "Trending" },
    { value: "popular", label: "Most read" },
  ];
  return (
    <div className="flex items-center gap-2">
      {options.map((o) => (
        <a
          key={o.value}
          href={`?sort=${o.value}`}
          className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
            current === o.value
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground/40"
          }`}
        >
          {o.label}
        </a>
      ))}
    </div>
  );
}
