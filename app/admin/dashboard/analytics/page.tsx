import { listPosts, countPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [posts, total] = await Promise.all([
    listPosts({ limit: 100, sort: "popular" }),
    countPosts(),
  ]);

  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const avgViews = posts.length ? Math.round(totalViews / posts.length) : 0;
  const top = posts.slice(0, 8);
  const maxViews = top[0]?.views || 1;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Analytics</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Overview</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total posts" value={String(total)} />
        <Stat label="Total reads" value={Intl.NumberFormat("en", { notation: "compact" }).format(totalViews)} />
        <Stat label="Total likes" value={String(totalLikes)} />
        <Stat label="Avg. reads/post" value={String(avgViews)} />
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="font-serif text-xl font-semibold">Top performing posts</h2>
        <ul className="mt-6 space-y-4">
          {top.map((p) => {
            const pct = Math.round((p.views / maxViews) * 100);
            return (
              <li key={p.slug}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate pr-4 font-medium">{p.title}</span>
                  <span className="shrink-0 text-muted">
                    {Intl.NumberFormat("en", { notation: "compact" }).format(p.views)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
          {top.length === 0 && (
            <li className="text-center text-sm text-muted">No data yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/60 p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
    </div>
  );
}
