import Link from "next/link";
import { PlusCircle, FileText, Eye, MessageCircle } from "lucide-react";
import { listPosts, countPosts, getCategoriesWithCounts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [latest, total, counts] = await Promise.all([
    listPosts({ limit: 5, sort: "latest" }),
    countPosts(),
    getCategoriesWithCounts(),
  ]);

  const totalViews = latest.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = latest.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Overview
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">Hello there.</h1>
        </div>
        <Link
          href="/admin/dashboard/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          New post
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total posts" value={String(total)} icon={FileText} />
        <Stat label="Recent reads" value={Intl.NumberFormat("en", { notation: "compact" }).format(totalViews)} icon={Eye} />
        <Stat label="Likes (latest 5)" value={String(totalLikes)} icon={MessageCircle} />
        <Stat label="Active categories" value={String(Object.keys(counts).length)} icon={FileText} />
      </div>

      <div className="rounded-3xl border border-border bg-surface/60">
        <div className="flex items-center justify-between p-6">
          <h2 className="font-serif text-xl font-semibold">Latest posts</h2>
          <Link href="/admin/dashboard/posts" className="text-sm text-muted hover:text-foreground">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {latest.map((p) => (
            <li key={p.slug} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <Link href={`/blog/${p.slug}`} className="block truncate font-medium hover:underline">
                  {p.title}
                </Link>
                <p className="text-xs text-muted">
                  {p.category} · {p.views} reads · {p.likes} likes
                </p>
              </div>
              <Link
                href={`/admin/dashboard/posts/${p.slug}/edit`}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-foreground/40"
              >
                Edit
              </Link>
            </li>
          ))}
          {latest.length === 0 && (
            <li className="px-6 py-10 text-center text-sm text-muted">
              No posts yet. Click "New post" to start.
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="font-serif text-xl font-semibold">By category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(counts).map(([cat, count]) => (
            <div key={cat} className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">{cat}</p>
              <p className="mt-1 font-serif text-xl font-semibold">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/60 p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
        <Icon className="h-4 w-4 text-muted" />
      </div>
      <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
    </div>
  );
}
