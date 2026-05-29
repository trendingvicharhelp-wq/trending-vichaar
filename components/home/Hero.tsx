"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { CATEGORY_LIST, formatDate } from "@/lib/utils";
import type { PostListItem } from "@/lib/posts";

interface HeroProps {
  featured: PostListItem;
}

export function Hero({ featured }: HeroProps) {
  const cat = CATEGORY_LIST.find((c) => c.slug === featured.category);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 animate-blob rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <div className="lg:col-span-7 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-muted backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-accent" />
            Daily Trends · Creative Ideas · AI · Design
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-8 font-serif text-display-2xl text-balance"
          >
            <span className="block text-foreground">Ideas worth</span>
            <span className="block italic text-accent">scrolling for.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-7 max-w-xl text-pretty text-lg text-muted"
          >
            A modern creative magazine covering AI tools, design, social media
            and the trends shaping the digital world — published daily,
            delivered slowly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              Start reading
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-foreground/40 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              Browse topics
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8"
          >
            <Stat label="Stories" value="320+" />
            <Stat label="Topics" value="9" />
            <Stat label="Monthly readers" value="48k" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative block overflow-hidden rounded-[2rem] border border-border bg-surface/60"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
                  <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Now trending
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/70">
                  {cat?.emoji} {cat?.name} · {formatDate(featured.publishedAt || new Date())}
                </p>
                <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-balance">
                  {featured.title}
                </h2>
                <span className="mt-4 inline-flex items-center gap-1 text-sm">
                  Read the story
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
    </div>
  );
}
