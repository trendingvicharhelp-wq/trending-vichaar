import Image from "next/image";
import { Twitter, Globe } from "lucide-react";

interface AuthorCardProps {
  author: { name: string; avatar?: string; bio?: string };
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-3xl border border-border bg-surface/60 p-6 sm:flex-row sm:items-center sm:p-8">
      {author.avatar && (
        <Image
          src={author.avatar}
          alt={author.name}
          width={72}
          height={72}
          className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
        />
      )}
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
          Written by
        </p>
        <h3 className="mt-1 font-serif text-2xl font-semibold">{author.name}</h3>
        {author.bio && (
          <p className="mt-2 text-pretty text-muted">{author.bio}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:border-foreground/40"
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href="/about"
          aria-label="Website"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:border-foreground/40"
        >
          <Globe className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
