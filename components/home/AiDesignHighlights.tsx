"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Cpu, Palette } from "lucide-react";
import type { PostListItem } from "@/lib/posts";

interface Props {
  ai: PostListItem[];
  design: PostListItem[];
}

export function AiDesignHighlights({ ai, design }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-foreground py-20 text-background lg:py-28">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl" />
      <div className="container relative">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <Column
            icon={<Cpu className="h-5 w-5" />}
            eyebrow="AI desk"
            title="What's worth running on your machine."
            href="/categories/ai-tools"
            posts={ai}
          />
          <Column
            icon={<Palette className="h-5 w-5" />}
            eyebrow="Design desk"
            title="The aesthetic shaping this season."
            href="/categories/graphic-design"
            posts={design}
          />
        </div>
      </div>
    </section>
  );
}

function Column({
  icon,
  eyebrow,
  title,
  href,
  posts,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  href: string;
  posts: PostListItem[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-background/60">
        {icon}
        {eyebrow}
      </div>
      <h2 className="mt-4 font-serif text-display-lg text-balance">{title}</h2>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
      >
        Explore the desk
        <ArrowUpRight className="h-4 w-4" />
      </Link>

      <div className="mt-10 space-y-4">
        {posts.slice(0, 3).map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              href={`/blog/${p.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.08]"
            >
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-background/50">
                  {p.readingTime}
                </p>
                <p className="mt-1 font-serif text-base font-medium leading-snug line-clamp-2">
                  {p.title}
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-background/50 transition group-hover:text-background" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
