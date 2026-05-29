"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_LIST } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function CategoriesGrid({ counts }: { counts: Record<string, number> }) {
  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Browse by topic"
          title="Nine corners of the internet"
          description="Pick a lane. Each topic is updated weekly with the freshest pieces."
          href="/categories"
          hrefLabel="All categories"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_LIST.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
            >
              <Link
                href={`/categories/${c.slug}`}
                className="group flex h-full items-center justify-between gap-4 rounded-3xl border border-border bg-surface/60 p-6 transition-all hover:border-foreground/30 hover:bg-surface"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-2xl transition-transform group-hover:scale-110 dark:bg-ink-800">
                    {c.emoji}
                  </span>
                  <div>
                    <p className="font-serif text-lg font-semibold">{c.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {counts[c.slug] ?? 0} stories
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
