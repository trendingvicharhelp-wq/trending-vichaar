import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWord?: boolean;
  href?: string;
}

export function Logo({ className, showWord = true, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Trending Vichaar — home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          aria-hidden="true"
          className="h-8 w-8 text-foreground transition-transform duration-500 group-hover:rotate-[8deg]"
        >
          <rect x="2" y="2" width="36" height="36" rx="10" className="fill-foreground" />
          <path
            d="M11 14h18M14 14v14M26 14v14"
            stroke="rgb(var(--background))"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="30" cy="11" r="3" className="fill-accent" />
        </svg>
      </span>
      {showWord && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            Trending<span className="text-accent">.</span>Vichaar
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-muted">
            Ideas in motion
          </span>
        </span>
      )}
    </Link>
  );
}
