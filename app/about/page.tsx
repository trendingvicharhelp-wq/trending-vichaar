import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Heart, Zap, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Trending Vichaar is a modern creative magazine covering AI tools, design, social media and digital culture.",
};

const PILLARS = [
  {
    icon: Sparkles,
    title: "Curated, not aggregated",
    body: "Every piece is hand-picked, read end-to-end, and edited like a print magazine. No filler.",
  },
  {
    icon: Heart,
    title: "Made for makers",
    body: "We write for the designers, freelancers, students and creators building things on the open web.",
  },
  {
    icon: Zap,
    title: "Fast where it matters",
    body: "Sub-second loads, zero-tracking analytics, mobile-first reading. We respect your time and attention.",
  },
  {
    icon: Target,
    title: "Trends with substance",
    body: "We don't chase virality. We surface the ideas that will still matter in six months.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-32 right-0 h-[36rem] w-[36rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="container py-20 lg:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            About us
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-display-2xl text-balance">
            A modern magazine for a faster
            <span className="italic text-accent"> internet</span>.
          </h1>
          <p className="mt-8 max-w-2xl text-pretty text-lg text-muted">
            Trending Vichaar is a daily-published, hand-edited digital
            magazine. We cover the ideas, tools, trends and aesthetic shaping
            the creative web — for the 18-35 generation that grew up online
            and is now building it.
          </p>
        </div>
      </section>

      <section className="border-b border-border py-20 lg:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              What we do
            </p>
            <h2 className="mt-4 font-serif text-display-lg text-balance">
              We write the magazine we wanted to read.
            </h2>
            <p className="mt-6 text-pretty text-lg text-muted">
              Most blogs are SEO landfill. Most newsletters drown your inbox.
              Trending Vichaar is a third path — a slow, careful, beautifully
              made publication that drops a handful of pieces a day, every day.
            </p>
            <p className="mt-4 text-pretty text-lg text-muted">
              Designers, AI researchers, social platform watchers and
              productivity tinkerers all contribute. The editor's job is to
              tie it together — into something with a real point of view.
            </p>
            <Link
              href="/blog"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              Read the magazine
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border">
            <Image
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80"
              alt="Stack of magazines on a wooden desk"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-20 lg:py-28">
        <div className="container">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            What we stand for
          </p>
          <h2 className="mt-4 font-serif text-display-lg text-balance">
            Four principles, one magazine.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-3xl border border-border bg-surface/60 p-8 transition hover:border-foreground/30"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-serif text-2xl font-semibold">
                  {p.title}
                </h3>
                <p className="mt-3 text-pretty text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Say hello
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-display-lg text-balance">
            Got a story, a tip, or a tool we should cover?
          </h2>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            Get in touch
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
