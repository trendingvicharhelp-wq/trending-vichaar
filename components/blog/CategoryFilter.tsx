"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORY_LIST, cn } from "@/lib/utils";

export function CategoryFilter({ basePath = "/blog" }: { basePath?: string }) {
  const sp = useSearchParams();
  const active = sp.get("category");

  const make = (slug?: string) => {
    const params = new URLSearchParams(sp.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    const q = params.toString();
    return `${basePath}${q ? `?${q}` : ""}`;
  };

  return (
    <div className="flex snap-x gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href={make(undefined)}
        className={cn(
          "shrink-0 snap-start rounded-full border px-4 py-2 text-sm transition",
          !active
            ? "border-foreground bg-foreground text-background"
            : "border-border hover:border-foreground/40"
        )}
      >
        All
      </Link>
      {CATEGORY_LIST.map((c) => {
        const isActive = active === c.slug;
        return (
          <Link
            key={c.slug}
            href={make(c.slug)}
            className={cn(
              "shrink-0 snap-start rounded-full border px-4 py-2 text-sm transition",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/40"
            )}
          >
            <span className="mr-1.5">{c.emoji}</span>
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
