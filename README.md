# Trending Vichaar

> **Daily Trends · Creative Ideas · AI · Design · Lifestyle · Digital World**

A modern, minimalist, production-ready blog platform built with Next.js 14 (App Router),
Tailwind CSS, Framer Motion, and MongoDB. Premium typography, dark/light mode,
SEO-ready, with a built-in admin dashboard for daily publishing.

---

## ✨ Features

**Frontend**
- Apple-style minimalism × editorial magazine layout
- Dark / light mode (next-themes, persisted)
- Smooth page transitions and Framer Motion micro-interactions
- Sticky table of contents, reading progress bar, share buttons
- Trending marquee, featured slider, AI/Design desks, newsletter, latest grid
- Search, filtering, sorting, pagination
- Empty states, loading states, custom 404
- Fully responsive — mobile, tablet, desktop
- Lazy-loaded images, optimized fonts

**Content**
- Markdown content with GFM, slugged headings, syntax highlighting hooks
- Reading time, view counters, like counters
- Tags + 9 curated categories
- Related posts, prev/next navigation, comments

**Admin Dashboard** (JWT-gated)
- Overview, posts list, analytics, settings
- Rich editor with live Markdown preview
- Cover image, category, tags, SEO, OG image, scheduling, featured toggle
- Draft / scheduled / published states
- Inline delete with confirmation

**SEO**
- Dynamic per-page metadata, OpenGraph + Twitter Cards
- Auto-generated `sitemap.xml`, `robots.txt`, `rss.xml`
- BlogPosting JSON-LD schema on every article
- Canonical URLs

**Backend**
- Next.js API routes (Node.js runtime) — `/api/posts`, `/api/auth`, `/api/comments`, `/api/newsletter`, `/api/contact`
- MongoDB + Mongoose models for Posts, Users, Comments, Subscribers
- JWT auth with HTTP-only cookies
- Falls back to bundled sample data so the site runs out of the box without MongoDB

---

## 🛠 Stack

| Layer      | Tech                                         |
| ---------- | -------------------------------------------- |
| Framework  | Next.js 14 (App Router) + TypeScript         |
| Styling    | Tailwind CSS + `@tailwindcss/typography`     |
| Animation  | Framer Motion                                |
| Icons      | Lucide                                       |
| Toasts     | Sonner                                       |
| Database   | MongoDB (Mongoose)                           |
| Auth       | JWT (httpOnly cookie) + bcrypt               |
| Markdown   | react-markdown + remark-gfm + rehype-slug    |
| Fonts      | Inter, Fraunces, JetBrains Mono              |

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` → `.env.local` and edit:

```bash
MONGODB_URI=mongodb://localhost:27017/trending-vichaar
JWT_SECRET=replace-with-a-long-random-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000

ADMIN_EMAIL=admin@trendingvichaar.com
ADMIN_PASSWORD=changeme123
ADMIN_NAME=Admin
```

> The site runs without `MONGODB_URI` — it falls back to bundled sample posts
> so you can preview the UI immediately. Set it before publishing real content.

### 3. (Optional) Seed the database

```bash
npm run seed
```

This creates the admin user from your env vars and inserts the sample posts.

### 4. Run

```bash
npm run dev
```

Visit:
- **Site** — http://localhost:3000
- **Admin** — http://localhost:3000/admin/login

---

## 🗂 Project structure

```
.
├── app/
│   ├── layout.tsx             # Root layout, fonts, navbar, footer
│   ├── page.tsx               # Homepage (hero, featured, categories, latest, AI/design, newsletter)
│   ├── loading.tsx            # Global loading animation
│   ├── not-found.tsx          # 404 page
│   ├── globals.css            # Design system
│   ├── sitemap.ts             # Dynamic sitemap.xml
│   ├── robots.ts              # robots.txt
│   ├── rss.xml/               # RSS feed
│   ├── blog/
│   │   ├── page.tsx           # Listing + filters + pagination
│   │   └── [slug]/page.tsx    # Single post with TOC, share, comments
│   ├── categories/
│   │   ├── page.tsx           # Category index
│   │   └── [slug]/page.tsx    # Posts by category
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── search/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx     # Auth-gated
│   │       ├── page.tsx       # Overview
│   │       ├── posts/         # List + new + edit
│   │       ├── analytics/
│   │       └── settings/
│   └── api/                   # All API routes
│       ├── auth/{login,logout,me}/
│       ├── posts/[...]
│       ├── comments/
│       ├── newsletter/
│       └── contact/
├── components/
│   ├── layout/                # Navbar, Footer, Logo, ReadingProgress
│   ├── home/                  # Homepage sections
│   ├── blog/                  # PostCard, TOC, Share, Author, Comments, Pagination, EmptyState
│   ├── admin/                 # Sidebar, LoginForm, PostEditor, DeleteButton
│   ├── contact/               # ContactForm
│   ├── search/                # SearchInput
│   ├── ui/                    # Badge, SectionHeading, ThemeToggle
│   └── providers.tsx          # Theme + Toaster
├── lib/
│   ├── db.ts                  # Mongoose connection
│   ├── auth.ts                # JWT helpers + cookie helpers
│   ├── posts.ts               # Read API (MongoDB → sample fallback)
│   ├── sample-data.ts         # 12 starter posts
│   └── utils.ts               # cn, dates, slugify, categories
├── models/                    # Mongoose schemas (User, Post, Comment, Subscriber)
├── public/                    # favicon, logo, og-image, manifest
├── scripts/seed.ts            # Database seeder
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## 🎨 Design notes

**Type system**
- Display: Fraunces (serif), variable optical sizing — used for hero, headings
- UI: Inter — used for body, navigation, UI
- Code: JetBrains Mono — used in admin editor and code blocks

**Color**
- Light: off-white background, near-black text, soft gray accents
- Dark: near-black background, off-white text
- Single accent: a warm orange (`#FF5E1A`) — used sparingly

**Spacing & rhythm**
- 80–112px section padding on desktop, 56–72px on mobile
- Container max-width 1400px with breathing room
- Rounded-3xl cards (1.5rem) for the premium-magazine feel

**Motion**
- Subtle fade + slide-up on scroll (Framer Motion `whileInView`)
- Animated layout pill in the navbar
- Marquee for trending bar, blob backgrounds in hero
- Reading progress bar with spring animation

---

## 🛡 Admin & authentication

The admin section is gated by a JWT stored in an HTTP-only cookie. Two ways to sign in:

1. **With MongoDB** — run `npm run seed` to create an admin user from your env
   vars, then sign in at `/admin/login`.
2. **Without MongoDB** — if `MONGODB_URI` is unset but `ADMIN_EMAIL` and
   `ADMIN_PASSWORD` are set, the login endpoint accepts those credentials
   directly. Useful for previewing the admin UI before connecting a database.

To create/edit posts you **must** have MongoDB configured — drafts are stored
in the database, not in sample data.

---

## 🧪 What's not included (yet)

This is a complete, production-ready starter. A few common additions you might
want to layer on for your specific deployment:

- A real email backend for the contact form and newsletter (Resend, Postmark)
- An image upload service for cover images (Cloudinary, S3, Uploadthing)
- A WYSIWYG editor on top of the Markdown textarea (TipTap, Lexical)
- A cron job to flip `scheduled` posts to `published` at their scheduled time
- Analytics integration (Plausible, Fathom, Umami)
- Rate-limiting on comments and newsletter endpoints

The shape of the code makes each of these a clean drop-in rather than a rewrite.

---

## 📄 License

MIT — use it, fork it, ship your own magazine.
