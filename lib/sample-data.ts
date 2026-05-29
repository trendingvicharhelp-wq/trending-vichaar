import type { IPost } from "@/models/Post";

type SamplePost = Omit<IPost, "_id" | "createdAt" | "updatedAt"> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const now = new Date("2026-05-29T10:00:00Z");
const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

const author = {
  name: "Pratik Lot",
  avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&q=80",
  bio: "Founder of Trending Vichaar. Writes about design, AI and the corners of the internet worth knowing about.",
};

export const SAMPLE_POSTS: SamplePost[] = [
  {
    _id: "s1",
    title: "The Quiet Rise of AI-Native Design Tools",
    slug: "ai-native-design-tools",
    excerpt:
      "Figma made design collaborative. The next wave of tools is making it generative — and rewriting the creative workflow in the process.",
    content: `## Designing with a co-pilot

For the last decade design tools optimized for **collaboration**. Today they're optimizing for **generation** — a fundamentally different posture.

The new generation of AI-native canvases treats prompts as primitives. You sketch an idea, describe a tone, and the canvas fills in the rest with vector layers you can actually edit.

### What this means for designers

- The "blank canvas problem" is being solved by software, not workshops.
- Junior designers can ship work that previously needed a senior eye.
- Taste — not technique — becomes the moat.

> The artists who win the next decade will be the ones who can articulate what they want with the precision of a director, not the dexterity of an illustrator.

### Three tools worth trying this week

1. **Recraft** — vector generation with surprisingly clean output.
2. **Magic Patterns** — turn prompts into editable React components.
3. **Galileo AI** — UI mockups from a single sentence.

The throughline is clear: the canvas is no longer a passive surface. It's a collaborator.`,
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1600&q=80",
    category: "ai-tools",
    tags: ["ai", "design", "tools", "workflow"],
    author,
    status: "published",
    publishedAt: days(1),
    scheduledFor: null,
    featured: true,
    views: 4821,
    likes: 312,
    readingTime: "5 min read",
    seo: {
      title: "The Quiet Rise of AI-Native Design Tools",
      description:
        "How a new generation of generative canvases is rewriting the creative workflow for designers.",
      keywords: ["ai design tools", "generative design", "figma alternatives"],
    },
    createdAt: days(1),
    updatedAt: days(1),
  },
  {
    _id: "s2",
    title: "Brutalism Is Back — But It Learned Some Manners",
    slug: "brutalism-is-back",
    excerpt:
      "Raw type, jagged grids, and a Helvetica with attitude. Why the new wave of brutalist design feels intentional, not edgy.",
    content: `## A movement, refined

Brutalism in web design used to mean: large type, no padding, scroll until your eyes bleed. The 2026 version keeps the **attitude** and loses the **hostility**.

### Where the discipline showed up

- Editorial sites use 1px hairlines instead of thick borders.
- Type stacks layer one weight against another, not three competing fonts.
- Color is reduced to two real choices and one accent — usually orange.

The result feels like a magazine that knows you're scrolling on a phone. Premium, fast, and unmistakably **itself**.`,
    coverImage:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1600&q=80",
    category: "graphic-design",
    tags: ["design", "typography", "brutalism", "editorial"],
    author,
    status: "published",
    publishedAt: days(2),
    scheduledFor: null,
    featured: true,
    views: 3210,
    likes: 244,
    readingTime: "4 min read",
    seo: {},
    createdAt: days(2),
    updatedAt: days(2),
  },
  {
    _id: "s3",
    title: "12 AI Tools That Replaced an App on My Phone",
    slug: "12-ai-tools-replaced-app",
    excerpt:
      "A working list of AI products that quietly killed an icon on my home screen — from notes to travel planning to job applications.",
    content: `## Tools that earned their spot

I deleted 12 apps this month. Here's what replaced them and why each switch stuck.

### Daily drivers

1. **Granola** — replaced Notion meeting notes.
2. **Raycast AI** — replaced Spotlight + Notes for quick thinking.
3. **Arc Search** — replaced Google for ambient questions.
4. **Perplexity Spaces** — replaced 4 Chrome tabs of research.

Each one had the same trait: it removed a step, not added a feature.`,
    coverImage:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&q=80",
    category: "ai-tools",
    tags: ["ai", "productivity", "tools"],
    author,
    status: "published",
    publishedAt: days(3),
    scheduledFor: null,
    featured: false,
    views: 8901,
    likes: 612,
    readingTime: "6 min read",
    seo: {},
    createdAt: days(3),
    updatedAt: days(3),
  },
  {
    _id: "s4",
    title: "The Aesthetic of Slow Internet",
    slug: "aesthetic-of-slow-internet",
    excerpt:
      "Why niche newsletters, slow blogs, and personal sites are reclaiming the corners of the web that algorithms forgot.",
    content: `## Quiet corners, loud impact

The algorithmic feed is exhausted. What's emerging in its place is a slower, weirder, more personal internet.

### Signals

- Newsletter subscriptions are up across every creator I track.
- Personal sites are coming back, often handwritten in raw HTML.
- "Digital gardens" replaced the linear blog format.

There's a generation that grew up online and is now deliberately building **smaller** rooms inside it.`,
    coverImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80",
    category: "lifestyle",
    tags: ["internet", "culture", "blogs", "writing"],
    author,
    status: "published",
    publishedAt: days(4),
    scheduledFor: null,
    featured: false,
    views: 2145,
    likes: 198,
    readingTime: "4 min read",
    seo: {},
    createdAt: days(4),
    updatedAt: days(4),
  },
  {
    _id: "s5",
    title: "Why Every Indie Brand Is Suddenly an Editorial",
    slug: "every-indie-brand-editorial",
    excerpt:
      "The shift from product pages to publications — and what small teams can copy from the playbook this week.",
    content: `## From storefront to story-front

Browse any indie brand and you'll find the same thing: an editorial section that reads better than most magazines.

### Why this works

- It earns search traffic that ads can't match.
- It compounds — every article keeps performing.
- It positions the brand as a **point of view**, not a SKU.

The lesson for solo creators is simple: write the magazine before you sell the merch.`,
    coverImage:
      "https://images.unsplash.com/photo-1542435503-956c469947f6?w=1600&q=80",
    category: "creativity",
    tags: ["branding", "content", "indie", "writing"],
    author,
    status: "published",
    publishedAt: days(5),
    scheduledFor: null,
    featured: false,
    views: 1820,
    likes: 142,
    readingTime: "5 min read",
    seo: {},
    createdAt: days(5),
    updatedAt: days(5),
  },
  {
    _id: "s6",
    title: "The Productivity Stack of a Solo Operator",
    slug: "productivity-stack-solo-operator",
    excerpt:
      "Four tools, two rituals, one unshakeable principle. How a one-person business stays out of meeting hell.",
    content: `## The whole stack

I run a one-person studio. Here is what stays on my dock, in priority order.

1. **Calendar** — Cron. Time-blocking is the only productivity system that ever worked.
2. **Tasks** — Things 3. Slow software for fast brains.
3. **Notes** — Obsidian. Plain text outlives every app.
4. **Comms** — Email. That's it.

The rituals: a weekly review on Sunday night, a daily shutdown at 6pm. The principle: every new tool has to **remove** something, not add.`,
    coverImage:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=80",
    category: "productivity",
    tags: ["productivity", "tools", "solo", "freelance"],
    author,
    status: "published",
    publishedAt: days(6),
    scheduledFor: null,
    featured: false,
    views: 5421,
    likes: 401,
    readingTime: "5 min read",
    seo: {},
    createdAt: days(6),
    updatedAt: days(6),
  },
  {
    _id: "s7",
    title: "How TikTok Killed the Long Caption — and What Replaced It",
    slug: "tiktok-killed-long-caption",
    excerpt:
      "Captions used to be miniature essays. Now they're a hook, a comma, and a dare. A field guide to the new grammar.",
    content: `## The new grammar of social

Captions in 2026 are doing less work — because the video is doing more of it.

### What changed

- Captions are now hooks, not summaries.
- Comments have replaced descriptions as the primary text surface.
- "Stitched context" is the new way to add nuance.

If you write for the internet, the lesson is sharp: the first six words are the entire ad.`,
    coverImage:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1600&q=80",
    category: "social-media",
    tags: ["social", "tiktok", "writing", "trends"],
    author,
    status: "published",
    publishedAt: days(7),
    scheduledFor: null,
    featured: false,
    views: 6710,
    likes: 521,
    readingTime: "4 min read",
    seo: {},
    createdAt: days(7),
    updatedAt: days(7),
  },
  {
    _id: "s8",
    title: "Eight Underrated Websites Worth Bookmarking This Week",
    slug: "underrated-websites-bookmark",
    excerpt:
      "A rolling list of small, weird, useful corners of the internet — updated weekly. This week: maps, music, and a museum of fonts.",
    content: `## This week's bookmarks

A fresh list of small sites worth your attention. None of them have a billion-dollar valuation. That's the point.

1. **Future Fonts** — a slow, curated type foundry.
2. **Window Swap** — a window in someone else's world.
3. **Radio Garden** — a globe you can listen to.
4. **Are.na** — the thinking person's Pinterest.
5. **PolicyGenius for Side Projects** — niche templates for solo makers.

I'll update this every Friday.`,
    coverImage:
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1600&q=80",
    category: "viral-trends",
    tags: ["websites", "discovery", "weekly"],
    author,
    status: "published",
    publishedAt: days(8),
    scheduledFor: null,
    featured: false,
    views: 3502,
    likes: 287,
    readingTime: "3 min read",
    seo: {},
    createdAt: days(8),
    updatedAt: days(8),
  },
  {
    _id: "s9",
    title: "The Notion Killer Isn't Notion-Shaped",
    slug: "notion-killer-not-notion-shaped",
    excerpt:
      "Every new productivity app is trying to beat Notion at its own game. The winning ones don't bother — they reframe the problem.",
    content: `## Stop competing on features

The Notion-shaped Notion-killer is a doomed product. The actually disruptive entrants are nothing like Notion.

### Three to watch

- **Capacities** — object-first, page-second.
- **Anytype** — local-first, encrypted, weird.
- **Tana** — the AI-native graph database that thinks for you.

None of them open with a blinking cursor on a blank page. That's the lesson.`,
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    category: "technology",
    tags: ["notion", "tools", "productivity"],
    author,
    status: "published",
    publishedAt: days(9),
    scheduledFor: null,
    featured: false,
    views: 4302,
    likes: 311,
    readingTime: "5 min read",
    seo: {},
    createdAt: days(9),
    updatedAt: days(9),
  },
  {
    _id: "s10",
    title: "Why Lo-Fi Hip Hop Won the Internet",
    slug: "lofi-hip-hop-won-internet",
    excerpt:
      "A loop, a girl, a rainstorm. The improbable rise of the most-watched livestream in YouTube history — and what every brand can learn from it.",
    content: `## The longest-running stream on the internet

The lofi girl loop has been playing for nearly a decade. It's the most-watched livestream in YouTube history. There's a lesson in that.

### What it nailed

- **A single, consistent vibe.** Not three. Not four. One.
- **No interruption.** Ads broke the spell, so they removed them.
- **A character.** The girl makes a sound feel like a place.

Every brand fights for attention. Lofi won by **earning the lack of it**.`,
    coverImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80",
    category: "music-culture",
    tags: ["music", "culture", "streaming", "branding"],
    author,
    status: "published",
    publishedAt: days(10),
    scheduledFor: null,
    featured: false,
    views: 7821,
    likes: 643,
    readingTime: "4 min read",
    seo: {},
    createdAt: days(10),
    updatedAt: days(10),
  },
  {
    _id: "s11",
    title: "The Email Setup of a Distraction-Free Creator",
    slug: "email-setup-distraction-free",
    excerpt:
      "Three folders, two filters, one ten-minute window a day. The boring system that gave me back six hours a week.",
    content: `## Three folders, one window

I check email twice a day for ten minutes. Here's how that's possible.

### The folders

- **Action** — anything that needs me to do something.
- **Waiting** — anything I'm expecting a reply on.
- **Read later** — newsletters, recaps, anything not urgent.

That's the whole system. Filters do the routing. The inbox itself stays empty.`,
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80",
    category: "productivity",
    tags: ["email", "productivity", "workflow"],
    author,
    status: "published",
    publishedAt: days(11),
    scheduledFor: null,
    featured: false,
    views: 2105,
    likes: 178,
    readingTime: "3 min read",
    seo: {},
    createdAt: days(11),
    updatedAt: days(11),
  },
  {
    _id: "s12",
    title: "What 2026's Instagram Looks Like — A Field Report",
    slug: "what-2026-instagram-looks-like",
    excerpt:
      "Carousels are dead. Reels are crowded. DMs are the new feed. A working snapshot of the platform's current center of gravity.",
    content: `## Where the attention went

Instagram in 2026 is not the Instagram of 2024. The center of gravity moved — twice.

### Three shifts to plan for

- **DMs** are now the dominant surface.
- **Broadcast channels** are the new email list.
- **Carousels** still convert, but only in saved-bookmark mode.

Build for where attention lives, not where it used to.`,
    coverImage:
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1600&q=80",
    category: "social-media",
    tags: ["instagram", "social", "trends", "creators"],
    author,
    status: "published",
    publishedAt: days(12),
    scheduledFor: null,
    featured: false,
    views: 5601,
    likes: 412,
    readingTime: "5 min read",
    seo: {},
    createdAt: days(12),
    updatedAt: days(12),
  },
];

export function getSamplePosts() {
  return SAMPLE_POSTS;
}
