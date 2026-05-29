import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ page, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const make = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const q = params.toString();
    return `${basePath}${q ? `?${q}` : ""}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={make(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:border-foreground/40"
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      {pages.map((p, i, arr) => (
        <span key={p} className="contents">
          {i > 0 && arr[i - 1] !== p - 1 && (
            <span className="px-1 text-muted">…</span>
          )}
          <Link
            href={make(p)}
            aria-current={p === page ? "page" : undefined}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition ${
              p === page
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/40"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={make(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:border-foreground/40"
        }`}
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
