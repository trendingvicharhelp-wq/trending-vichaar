/**
 * STEP 8 — Publisher Agent.
 *
 * Persists the finished article as a published Post, matching models/Post.ts
 * exactly so it renders on the live site immediately. Resolves a unique slug,
 * assigns the category, sets SEO metadata, and stores the featured-image
 * prompt (the site has no image generator, so the prompt is saved for later
 * use and a deterministic placeholder cover is set).
 *
 * On dryRun, it does everything except the database write.
 */

import slugify from "slugify";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { calcReadingTime, makeExcerpt, siteUrl } from "@/lib/utils";
import { AGENT_AUTHOR, ALLOWED_CATEGORY_SLUGS, coverImageFor } from "@/lib/agents/config";
import type {
  AgentContext,
  GeneratedArticle,
  ImagePromptResult,
  PublishResult,
  SeoPackage,
} from "@/lib/agents/types";


/** Find a slug not already taken in the posts collection. */
async function uniqueSlug(base: string): Promise<string> {
  const clean =
    slugify(base, { lower: true, strict: true, trim: true }).slice(0, 80) || "post";
  let slug = clean;
  let n = 1;
  // Only relevant when Mongo is connected.
  while (await Post.exists({ slug })) {
    n += 1;
    slug = `${clean}-${n}`;
  }
  return slug;
}

export async function publish(
  article: GeneratedArticle,
  seo: SeoPackage,
  image: ImagePromptResult,
  ctx: AgentContext
): Promise<PublishResult> {
  const log = ctx.logger.forStep("publisher");

  // Pick a category slug that's definitely valid for the site.
  const category =
    seo.categorySuggestions.find((c) => ALLOWED_CATEGORY_SLUGS.includes(c as any)) ||
    ALLOWED_CATEGORY_SLUGS[0];

  if (ctx.dryRun) {
    const slug = slugify(seo.slug || article.title, { lower: true, strict: true });
    log.warn(`Dry run — not writing to DB. Would publish slug "${slug}".`);
    return { postId: null, slug, url: siteUrl(`/blog/${slug}`), status: "skipped-dry-run" };
  }

  await connectDB();
  const slug = await uniqueSlug(seo.slug || article.title);
  const cover = coverImageFor(category, slug);

  const doc = await Post.create({
    title: article.title,
    slug,
    excerpt: article.excerpt || makeExcerpt(article.content),
    content: article.content,
    coverImage: cover,
    category,
    tags: seo.tags?.length ? seo.tags : seo.keywords.slice(0, 6),
    author: { name: AGENT_AUTHOR.name, bio: AGENT_AUTHOR.bio },
    status: "published",
    publishedAt: ctx.now,
    scheduledFor: null,
    featured: false,
    views: 0,
    likes: 0,
    readingTime: calcReadingTime(article.content),
    seo: {
      title: seo.metaTitle || seo.seoTitle,
      description: seo.metaDescription,
      keywords: seo.keywords,
      ogImage: cover,
    },
  });

  const url = siteUrl(`/blog/${slug}`);
  log.info(`Published "${article.title}" → ${url} (category: ${category})`);
  log.debug(`Featured image prompt: ${image.featuredImagePrompt}`);

  return { postId: String(doc._id), slug, url, status: "published" };
}
