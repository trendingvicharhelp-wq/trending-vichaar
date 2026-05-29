import Link from "next/link";
import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  description = "We couldn’t find anything matching your filters. Try a different topic or check back soon.",
  href = "/blog",
  hrefLabel = "Browse all posts",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/40 px-8 py-20 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
        <FileQuestion className="h-6 w-6 text-muted" />
      </span>
      <h3 className="mt-6 font-serif text-2xl text-balance">{title}</h3>
      <p className="mt-3 max-w-md text-pretty text-muted">{description}</p>
      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
      >
        {hrefLabel}
      </Link>
    </div>
  );
}
