"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, BarChart3, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/posts", label: "Posts", icon: FileText },
  { href: "/admin/dashboard/posts/new", label: "New post", icon: PlusCircle },
  { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-border bg-surface/60 p-6">
      <Logo />
      <p className="mt-6 text-xs uppercase tracking-[0.22em] text-muted">
        Signed in as
      </p>
      <p className="mt-1 font-medium">{adminName}</p>

      <nav className="mt-8 flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition",
                active
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-ink-100 hover:text-foreground dark:hover:bg-ink-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-6 inline-flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-2.5 text-sm text-muted transition hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
