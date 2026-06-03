import Link from "next/link";
import Image from "next/image";
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
        <Image
          src="/logo.png"
          alt="Trending Vichaar logo"
          width={64}
          height={64}
          priority
          className="h-8 w-8 object-contain transition-transform duration-500 group-hover:rotate-[8deg]"
        />
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
