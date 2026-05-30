import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "…";
}

export function calcReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

export function makeExcerpt(content: string, maxLen = 180) {
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return truncate(plain, maxLen);
}

export function siteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export const CATEGORY_LIST = [
  // Evergreen categories used by the AI content agent (see lib/agents/config.ts).
  { slug: "artificial-intelligence", name: "Artificial Intelligence", emoji: "🧠" },
  { slug: "ai-tools", name: "AI Tools", emoji: "🤖" },
  { slug: "technology", name: "Technology", emoji: "💻" },
  { slug: "software-apps", name: "Software & Apps", emoji: "🧩" },
  { slug: "future-tech", name: "Future Technology", emoji: "🚀" },
  { slug: "productivity", name: "Productivity", emoji: "⚡" },
  { slug: "graphic-design", name: "Graphic Design", emoji: "🎨" },
  { slug: "social-media", name: "Social Media", emoji: "📱" },
  { slug: "creator-economy", name: "Creator Economy", emoji: "🎬" },
  { slug: "digital-lifestyle", name: "Digital Lifestyle", emoji: "🌐" },
  { slug: "internet-culture", name: "Internet Culture", emoji: "🔥" },
  { slug: "consumer-products", name: "Trending Products", emoji: "🛍️" },
  { slug: "cars", name: "Cars & EVs", emoji: "🚗" },
  { slug: "crypto", name: "Crypto & Blockchain", emoji: "🪙" },
  { slug: "travel", name: "Travel", emoji: "✈️" },
  { slug: "fashion", name: "Fashion", emoji: "👗" },
  { slug: "skincare", name: "Skincare", emoji: "🧴" },
  // Legacy slugs kept so existing sample-data posts still render.
  { slug: "creativity", name: "Creativity", emoji: "✨" },
  { slug: "viral-trends", name: "Viral Trends", emoji: "🌟" },
  { slug: "lifestyle", name: "Lifestyle", emoji: "🌿" },
  { slug: "music-culture", name: "Music & Culture", emoji: "🎧" },
] as const;

export type CategorySlug = (typeof CATEGORY_LIST)[number]["slug"];
