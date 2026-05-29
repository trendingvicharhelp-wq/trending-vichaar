import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "accent";
}

export function Badge({ children, className, variant = "outline" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
        variant === "outline" && "border border-border bg-surface/60 text-foreground",
        variant === "default" && "bg-foreground text-background",
        variant === "accent" && "bg-accent text-white",
        className
      )}
    >
      {children}
    </span>
  );
}
