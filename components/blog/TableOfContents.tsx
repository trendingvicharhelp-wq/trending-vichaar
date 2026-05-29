"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observers: IntersectionObserver[] = [];
    const els: HTMLElement[] = [];

    const wire = () => {
      headings.forEach((h) => {
        const el = document.getElementById(h.id);
        if (!el) return;
        els.push(el);
        const obs = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) setActive(h.id);
            }
          },
          { rootMargin: "-30% 0% -60% 0%", threshold: 0 }
        );
        obs.observe(el);
        observers.push(obs);
      });
    };

    // headings get IDs from rehype-slug after render; wait one frame
    const id = window.requestAnimationFrame(wire);
    return () => {
      window.cancelAnimationFrame(id);
      observers.forEach((o) => o.disconnect());
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-28 hidden lg:block" aria-label="Table of contents">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
        In this article
      </p>
      <ul className="mt-4 space-y-2 border-l border-border pl-4 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={cn(h.level === 3 && "pl-3")}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block py-1 leading-snug transition-colors",
                active === h.id
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(md: string): Heading[] {
  const lines = md.split("\n");
  const headings: Heading[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (m) {
      const text = m[2].replace(/[#*_`]+/g, "").trim();
      headings.push({
        id: slugify(text),
        text,
        level: m[1].length,
      });
    }
  }
  return headings;
}
