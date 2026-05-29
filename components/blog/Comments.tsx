"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";

interface Comment {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

export function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, postSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn’t post comment");
      setComments((c) => [data.comment, ...c]);
      setForm({ name: "", email: "", content: "" });
      toast.success("Comment posted");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="comments" className="mt-16">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-5 w-5 text-accent" />
        <h2 className="font-serif text-2xl font-semibold">
          Comments {comments.length > 0 && <span className="text-muted">({comments.length})</span>}
        </h2>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-border bg-surface/60 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
          />
          <input
            required
            type="email"
            placeholder="Email (not published)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
          />
        </div>
        <textarea
          required
          rows={4}
          placeholder="Share your thoughts…"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Be kind. Stay on topic. Don’t spam.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-muted">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No comments yet — be the first.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="rounded-2xl border border-border bg-surface/60 p-5"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">{c.name}</p>
                  <time className="text-xs text-muted">{timeAgo(c.createdAt)}</time>
                </div>
                <p className="mt-2 text-pretty text-ink-800 dark:text-ink-200">
                  {c.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
