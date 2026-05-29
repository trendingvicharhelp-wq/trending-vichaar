import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORY_LIST } from "@/lib/utils";
import { listPosts, countPosts } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import { EmptyState } from "@/components/blog/EmptyState";

export const revalidate = 60;

const PAGE_SIZE = 9;

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateStaticParams() {
  return CATEGORY_LIST.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cat = CATEGORY_LIST.find((c) => c.slug === params.slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.name}`,
    description: `${cat.name} stories on Trending Vichaar — fresh pieces, updated weekly.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const cat = CATEGORY_LIST.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const [posts, total] = await Promise.all([
    listPosts({ category: params.slug, limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    countPosts({ category: params.slug }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <section className="border-b border-border">
        <div className="container py-16 lg:py-24">
          <Link
            href="/categories"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← All categories
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink-100 text-3xl dark:bg-ink-800">
              {cat.emoji}
            </span>
            <h1 className="font-serif text-display-xl text-balance">{cat.name}</h1>
          </div>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted">
            {total} {total === 1 ? "story" : "stories"} on{" "}
            <span className="text-foreground">{cat.name.toLowerCase()}</span>.
          </p>
        </div>
      </section>

      <section className="container py-16">
        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet in this corner"
            description="We're still curating this category. Check back soon — or browse the rest."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.slug} post={p} index={i} />
            ))}
          </div>
        )}

        <div className="mt-16">
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath={`/categories/${params.slug}`}
          />
        </div>
      </section>
    </>
  );
}
