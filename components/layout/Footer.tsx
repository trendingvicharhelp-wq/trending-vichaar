import Link from "next/link";
import { Instagram, Twitter, Youtube, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { CATEGORY_LIST } from "@/lib/utils";

const SOCIALS = [
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "https://www.instagram.com/trending.vichaar", label: "Instagram", icon: Instagram },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  { href: "https://github.com", label: "GitHub", icon: Github },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="container py-16 lg:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-md text-pretty text-muted">
              Daily trends, creative ideas and the corners of the internet
              worth knowing about. A modern magazine for designers, creators
              and the perpetually curious.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <a href="mailto:trendingvichar.help@gmail.com" className="link-underline">
                  trendingvichar.help@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Jaipur, India
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:border-foreground/40 hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-[0.22em] text-muted">
              Explore
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/" className="link-underline">Home</Link></li>
              <li><Link href="/blog" className="link-underline">Blog</Link></li>
              <li><Link href="/categories" className="link-underline">Categories</Link></li>
              <li><Link href="/about" className="link-underline">About</Link></li>
              <li><Link href="/contact" className="link-underline">Contact</Link></li>
              <li><Link href="/search" className="link-underline">Search</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.22em] text-muted">
              Topics
            </h4>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {CATEGORY_LIST.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categories/${c.slug}`} className="link-underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 border-t border-border pt-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Trending Vichaar — Daily Trends • Creative Ideas • AI • Design.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="link-underline">Privacy</Link>
            <Link href="/terms" className="link-underline">Terms</Link>
            <Link href="/admin/login" className="link-underline">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
