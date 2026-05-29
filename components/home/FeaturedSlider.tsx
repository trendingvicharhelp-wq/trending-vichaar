"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CATEGORY_LIST, formatDate } from "@/lib/utils";
import type { PostListItem } from "@/lib/posts";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedSlider({ posts }: { posts: PostListItem[] }) {
  const [index, setIndex] = useState(0);
  if (posts.length === 0) return null;
  const active = posts[index];
  const cat = CATEGORY_LIST.find((c) => c.slug === active.category);

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + posts.length) % posts.length);

  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Featured this week"
          title="Hand-picked stories"
          description="The pieces our editors keep coming back to — the ones worth slowing down for."
          href="/blog?filter=featured"
          hrefLabel="See all featured"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.slug}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={active.coverImage}
                    alt={active.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {posts.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-8 bg-foreground" : "w-3 bg-ink-300 dark:bg-ink-700"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => go(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:border-foreground/40"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => go(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:border-foreground/40"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  {cat?.emoji} {cat?.name} ·{" "}
                  {active.publishedAt ? formatDate(active.publishedAt) : ""}
                </p>
                <h3 className="mt-4 font-serif text-display-lg text-balance">
                  <Link href={`/blog/${active.slug}`} className="link-underline">
                    {active.title}
                  </Link>
                </h3>
                <p className="mt-5 text-pretty text-muted">{active.excerpt}</p>
                <Link
                  href={`/blog/${active.slug}`}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
                >
                  Read story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
