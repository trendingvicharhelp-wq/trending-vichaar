"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check } from "lucide-react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
      toast.success("You're in. Watch your inbox.");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-border bg-surface/60 p-8 md:p-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                The Vichaar Letter
              </p>
              <h2 className="mt-4 font-serif text-display-lg text-balance">
                Trends, tools and ideas — every Sunday at 9am.
              </h2>
              <p className="mt-5 max-w-md text-pretty text-muted">
                One short email a week. No fluff. Just what's worth your
                attention from the worlds of AI, design and the open web.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background p-2 pl-5 transition focus-within:border-foreground/40">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@goodtaste.com"
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted/70"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={loading || done}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
                >
                  {done ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {done ? "Subscribed" : loading ? "…" : "Subscribe"}
                </button>
              </div>
              <p className="px-2 text-xs text-muted">
                By subscribing you agree to our friendly privacy policy. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
