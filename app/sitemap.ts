import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/posts";
import { CATEGORY_LIST, siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPosts({ limit: 1000 });

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/categories",
    "/about",
    "/contact",
    "/search",
    "/privacy",
    "/terms",
  ].map((p) => ({
    url: siteUrl(p),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_LIST.map((c) => ({
    url: siteUrl(`/categories/${c.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: siteUrl(`/blog/${p.slug}`),
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
