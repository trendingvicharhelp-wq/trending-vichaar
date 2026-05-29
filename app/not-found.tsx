import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden py-24 text-center">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <p className="text-xs uppercase tracking-[0.3em] text-muted">
        Error 404 — page off the grid
      </p>

      <h1 className="mt-6 font-serif text-display-2xl text-balance">
        <span className="block text-foreground">Lost in the</span>
        <span className="block italic text-accent">scroll.</span>
      </h1>

      <p className="mt-6 max-w-lg text-pretty text-muted">
        The article you’re hunting for isn’t here — but the homepage has a fresh
        list of trending pieces ready for you.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          <Search className="h-4 w-4" />
          Search articles
        </Link>
      </div>
    </section>
  );
}
