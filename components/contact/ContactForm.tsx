"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { toast } from "sonner";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send your message");
      setSent(true);
      toast.success("Message sent — we’ll be in touch.");
      setForm({ name: "", email: "", topic: "general", message: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border bg-surface/60 p-6 md:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          required
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <Field
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.22em] text-muted">
          What's this about?
        </label>
        <select
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
        >
          <option value="general">A general hello</option>
          <option value="tip">I have a story tip</option>
          <option value="partnership">Partnership or sponsorship</option>
          <option value="feedback">Feedback on a piece</option>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.22em] text-muted">
          Your message
        </label>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
          placeholder="Tell us what's on your mind…"
        />
      </div>
      <button
        type="submit"
        disabled={loading || sent}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {sent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        {sent ? "Sent" : loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.22em] text-muted">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground/40"
      />
    </div>
  );
}
