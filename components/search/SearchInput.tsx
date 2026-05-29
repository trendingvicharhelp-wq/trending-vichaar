"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-full border border-border bg-background p-2 pl-6 transition focus-within:border-foreground/40"
    >
      <Search className="h-5 w-5 text-muted" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles, topics, tools…"
        className="flex-1 bg-transparent py-2 text-lg outline-none placeholder:text-muted/70"
        aria-label="Search"
      />
      <button
        type="submit"
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
