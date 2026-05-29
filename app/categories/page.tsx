import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_LIST } from "@/lib/utils";
import { getCategoriesWithCounts } from "@/lib/posts";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse Trending Vichaar by topic — AI, design, social media, productivity and more.",
};

export default async function CategoriesPage() {
  const counts = await getCategoriesWithCounts();

  return (
    <>
      <section className="border-b border-border">
        <div className="container py-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            All topics
          </p>
          <h1 className="mt-4 font-serif text-display-xl text-balance">
            Nine corners.
            <br />
            <span className="italic text-accent">One magazine.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted">
            Each topic is a curated stream. Pick a corner and keep scrolling.
          </p>
        </div>
      </section>

      <section className="container py-16 lg:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_LIST.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 transition-all hover:border-foreground/30 hover:bg-surface"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/0 transition-all duration-500 group-hover:bg-accent/10 group-hover:blur-2xl" />
              <div className="flex items-start justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-3xl dark:bg-ink-800">
                  {c.emoji}
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <h2 className="mt-8 font-serif text-2xl font-semibold">
                {c.name}
              </h2>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted">
                {counts[c.slug] ?? 0} {(counts[c.slug] ?? 0) === 1 ? "story" : "stories"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
