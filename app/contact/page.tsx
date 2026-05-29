import type { Metadata } from "next";
import { Mail, MapPin, Twitter, Instagram } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Trending Vichaar — partnerships, tips, feedback or just a hello.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="container py-20 lg:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Contact
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-display-2xl text-balance">
            Let's <span className="italic text-accent">talk</span>.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg text-muted">
            Partnerships, story tips, feedback or just a hello — drop us a
            line and we'll write back. Usually within a day.
          </p>
        </div>
      </section>

      <section className="container py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="space-y-8">
              <Contact
                icon={Mail}
                title="Email"
                value="trendingvichar.help@gmail.com"
                href="mailto:trendingvichar.help@gmail.com"
              />
              <Contact
                icon={MapPin}
                title="Address"
                value="Jaipur, India"
                href="https://www.google.com/maps/search/?api=1&query=Jaipur%2C+India"
              />
              <Contact
                icon={Twitter}
                title="Twitter / X"
                value="@trendingvichaar"
                href="https://twitter.com"
              />
              <Contact
                icon={Instagram}
                title="Instagram"
                value="@trending.vichaar"
                href="https://instagram.com"
              />
            </div>

            <div className="mt-12 rounded-3xl border border-border bg-surface/60 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Newsroom hours
              </p>
              <p className="mt-3 font-serif text-xl">
                Mon — Fri · 10:00 to 18:00 IST
              </p>
              <p className="mt-2 text-sm text-muted">
                Replies on weekends are slower but they do happen.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

function Contact({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: any;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group flex items-start gap-4"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface/60 transition group-hover:border-foreground/40">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{title}</p>
        <p className="mt-1 font-serif text-lg group-hover:underline">{value}</p>
      </div>
    </a>
  );
}
