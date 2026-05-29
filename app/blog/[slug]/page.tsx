import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Heart } from "lucide-react";
import {
  getAdjacentPosts,
  getPostBySlug,
  incrementViews,
  listPosts,
} from "@/lib/posts";
import { CATEGORY_LIST, formatDate, siteUrl } from "@/lib/utils";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { Comments } from "@/components/blog/Comments";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { ReadingProgress } from "@/components/layout/ReadingProgress";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    keywords: post.seo?.keywords || post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      authors: [post.author.name],
      images: [{ url: post.seo?.ogImage || post.coverImage, width: 1600, height: 900 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.seo?.ogImage || post.coverImage],
    },
  };
}

export default async function SingleBlogPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  await incrementViews(params.slug);

  const cat = CATEGORY_LIST.find((c) => c.slug === post.category);
  const [related, { prev, next }] = await Promise.all([
    listPosts({ category: post.category, excludeSlug: params.slug, limit: 3 }),
    getAdjacentPosts(params.slug),
  ]);

  const url = siteUrl(`/blog/${post.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author.name },
    publisher: {
      "@type": "Organization",
      name: "Trending Vichaar",
      logo: { "@type": "ImageObject", url: siteUrl("/logo.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <article>
      <ReadingProgress />

      <header className="border-b border-border">
        <div className="container py-14 lg:py-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All stories
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {cat && (
              <Link href={`/categories/${cat.slug}`}>
                <Badge variant="accent">
                  <span className="mr-0.5">{cat.emoji}</span>
                  {cat.name}
                </Badge>
              </Link>
            )}
            {post.featured && <Badge>Editor’s pick</Badge>}
          </div>

          <h1 className="mt-6 max-w-4xl font-serif text-display-xl text-balance">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted">
            {post.excerpt}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-3">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-foreground">{post.author.name}</span>
            </div>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
            <time dateTime={String(post.publishedAt)}>
              {post.publishedAt ? formatDate(post.publishedAt) : ""}
            </time>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {Intl.NumberFormat("en", { notation: "compact" }).format(post.views)} reads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              {post.likes}
            </span>
          </div>
        </div>
      </header>

      <div className="container py-12 lg:py-16">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1100px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="container pb-20 lg:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <TableOfContents content={post.content} />
          </aside>

          <div className="lg:col-span-9">
            <MarkdownContent content={post.content} />

            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wider text-muted transition hover:border-foreground/40 hover:text-foreground"
                >
                  #{t}
                </Link>
              ))}
            </div>

            <div className="my-12 border-t border-border pt-8">
              <ShareButtons url={url} title={post.title} />
            </div>

            <AuthorCard author={post.author} />

            {(prev || next) && (
              <nav className="mt-12 grid gap-4 sm:grid-cols-2" aria-label="Article navigation">
                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group rounded-3xl border border-border bg-surface/60 p-6 transition hover:border-foreground/30"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
                      ← Previous
                    </p>
                    <p className="mt-3 font-serif text-lg font-semibold leading-snug line-clamp-2">
                      {prev.title}
                    </p>
                  </Link>
                ) : <span />}
                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group rounded-3xl border border-border bg-surface/60 p-6 text-right transition hover:border-foreground/30"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
                      Next →
                    </p>
                    <p className="mt-3 font-serif text-lg font-semibold leading-snug line-clamp-2">
                      {next.title}
                    </p>
                  </Link>
                ) : <span />}
              </nav>
            )}

            <Comments slug={post.slug} />
          </div>
        </div>
      </div>

      <RelatedPosts posts={related} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
