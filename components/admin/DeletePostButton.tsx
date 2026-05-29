"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeletePostButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this post? This action can't be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      toast.success("Post deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red-500/40 hover:text-red-500 disabled:opacity-60"
    >
      <Trash2 className="h-3 w-3" />
      {loading ? "…" : "Delete"}
    </button>
  );
}
