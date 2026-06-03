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
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[8deg]"
        >
          <circle cx="50" cy="50" r="50" fill="#111111" />
          {/* T */}
          <rect x="20" y="30" width="38" height="12.5" rx="6.25" fill="#ffffff" />
          <rect x="32.75" y="30" width="12.5" height="46" rx="6.25" fill="#ffffff" />
          {/* V */}
          <path
            d="M51 40 L62 73 L73 40"
            fill="none"
            stroke="#FF5E1A"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* dot */}
          <circle cx="78" cy="33" r="7.5" fill="#FF5E1A" />
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
