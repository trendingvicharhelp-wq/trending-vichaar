"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Save, Send, Calendar, Image as ImageIcon } from "lucide-react";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { CATEGORY_LIST } from "@/lib/utils";

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  featured: boolean;
  status: "draft" | "scheduled" | "published";
  scheduledFor: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

interface PostEditorProps {
  initial?: Partial<PostForm>;
  mode: "new" | "edit";
  postSlug?: string;
}

const EMPTY: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "## Start here\n\nWrite your thoughts.",
  coverImage: "",
  category: "ai-tools",
  tags: "",
  featured: false,
  status: "draft",
  scheduledFor: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImage: "",
};

export function PostEditor({ initial = {}, mode, postSlug }: PostEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<PostForm>({ ...EMPTY, ...initial });
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PostForm>(key: K, value: PostForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function autoSlug() {
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    update("slug", slug);
  }

  async function save(targetStatus: PostForm["status"]) {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        featured: form.featured,
        status: targetStatus,
        scheduledFor: form.scheduledFor || null,
        seo: {
          title: form.seoTitle,
          description: form.seoDescription,
          keywords: form.seoKeywords.split(",").map((t) => t.trim()).filter(Boolean),
          ogImage: form.ogImage,
        },
      };

      const url = mode === "new" ? "/api/posts" : `/api/posts/${postSlug}`;
      const method = mode === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(
        targetStatus === "published"
          ? "Published"
          : targetStatus === "scheduled"
          ? "Scheduled"
          : "Saved as draft"
      );
      if (mode === "new") router.replace(`/admin/dashboard/posts/${data.post.slug}/edit`);
      else router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {mode === "new" ? "New post" : "Edit post"}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">
            {form.title || "Untitled draft"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => save("draft")}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition hover:border-foreground/40 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
          {form.scheduledFor && (
            <button
              type="button"
              onClick={() => save("scheduled")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent transition hover:bg-accent/20 disabled:opacity-60"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </button>
          )}
          <button
            type="button"
            onClick={() => save("published")}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {form.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <input
              placeholder="A bold, memorable title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              onBlur={() => !form.slug && autoSlug()}
              className="w-full bg-transparent font-serif text-3xl font-semibold outline-none placeholder:text-muted/60"
            />
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-sm text-muted">
              <span className="text-xs uppercase tracking-[0.18em]">Slug</span>
              <input
                placeholder="auto-generated"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder:text-muted/60"
              />
            </div>
          </Card>

          <Card>
            <Label>Excerpt</Label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="One-line summary shown in cards and listings"
              className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-muted/60"
            />
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <Label>Body</Label>
              <div className="flex items-center gap-1 rounded-full border border-border p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={`rounded-full px-3 py-1 transition ${
                    tab === "write" ? "bg-foreground text-background" : "text-muted"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
                    tab === "preview" ? "bg-foreground text-background" : "text-muted"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
              </div>
            </div>
            {tab === "write" ? (
              <textarea
                rows={22}
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                className="w-full resize-y rounded-2xl border border-border bg-background p-4 font-mono text-sm leading-relaxed outline-none focus:border-foreground/40"
                placeholder="Markdown supported — use ## for headings, ** for bold."
              />
            ) : (
              <div className="rounded-2xl border border-border bg-background p-6">
                <MarkdownContent content={form.content} />
              </div>
            )}
          </Card>

          <Card>
            <Label>SEO</Label>
            <div className="mt-3 space-y-3">
              <Input
                placeholder="SEO title (defaults to post title)"
                value={form.seoTitle}
                onChange={(v) => update("seoTitle", v)}
              />
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={(e) => update("seoDescription", e.target.value)}
                placeholder="Meta description (defaults to excerpt)"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
              <Input
                placeholder="Keywords (comma separated)"
                value={form.seoKeywords}
                onChange={(v) => update("seoKeywords", v)}
              />
              <Input
                placeholder="OG image URL (defaults to cover image)"
                value={form.ogImage}
                onChange={(v) => update("ogImage", v)}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <Label>Status</Label>
            <p className="mt-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    form.status === "published"
                      ? "bg-emerald-500"
                      : form.status === "scheduled"
                      ? "bg-amber-500"
                      : "bg-ink-400"
                  }`}
                />
                {form.status === "published" ? "Published" : form.status === "scheduled" ? "Scheduled" : "Draft"}
              </span>
            </p>
          </Card>

          <Card>
            <Label>Cover image</Label>
            <div className="mt-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted" />
              <input
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
                placeholder="https://…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60"
              />
            </div>
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImage}
                alt="Cover preview"
                className="mt-3 aspect-[16/9] w-full rounded-2xl object-cover"
              />
            )}
          </Card>

          <Card>
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </Card>

          <Card>
            <Label>Tags</Label>
            <Input
              className="mt-3"
              placeholder="ai, design, tools"
              value={form.tags}
              onChange={(v) => update("tags", v)}
            />
            <p className="mt-2 text-xs text-muted">Comma-separated</p>
          </Card>

          <Card>
            <Label>Schedule</Label>
            <input
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) => update("scheduledFor", e.target.value)}
              className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
            />
            <p className="mt-2 text-xs text-muted">Leave empty to publish immediately.</p>
          </Card>

          <Card>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Feature on homepage
            </label>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/60 p-5 md:p-6">
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.22em] text-muted">{children}</p>;
}
function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40 ${className}`}
    />
  );
}
