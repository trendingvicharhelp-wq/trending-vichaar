import { listPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/utils";

export const revalidate = 600;

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = await listPosts({ limit: 40 });

  const items = posts
    .map(
      (p) => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${siteUrl(`/blog/${p.slug}`)}</link>
      <guid>${siteUrl(`/blog/${p.slug}`)}</guid>
      <pubDate>${(p.publishedAt ? new Date(p.publishedAt) : new Date()).toUTCString()}</pubDate>
      <description>${escape(p.excerpt)}</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Trending Vichaar</title>
    <link>${siteUrl()}</link>
    <description>Daily Trends • Creative Ideas • AI • Design</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
