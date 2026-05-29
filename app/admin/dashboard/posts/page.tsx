import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { listPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

export default async function PostsListPage() {
  const posts = await listPosts({ limit: 100, sort: "latest" });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Posts</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">
            All articles
          </h1>
        </div>
        <Link
          href="/admin/dashboard/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          New post
        </Link>
      </header>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface/60">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background/40 text-xs uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Title</th>
              <th className="px-6 py-4 text-left font-medium">Category</th>
              <th className="px-6 py-4 text-left font-medium">Published</th>
              <th className="px-6 py-4 text-left font-medium">Reads</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((p) => (
              <tr key={p.slug} className="transition hover:bg-background/40">
                <td className="px-6 py-4">
                  <Link href={`/blog/${p.slug}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-muted">{p.category}</td>
                <td className="px-6 py-4 text-muted">
                  {p.publishedAt ? formatDate(p.publishedAt) : "—"}
                </td>
                <td className="px-6 py-4 text-muted">
                  {Intl.NumberFormat("en", { notation: "compact" }).format(p.views)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/dashboard/posts/${p.slug}/edit`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-foreground/40"
                    >
                      Edit
                    </Link>
                    <DeletePostButton slug={p.slug} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
