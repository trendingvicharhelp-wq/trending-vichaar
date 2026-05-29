"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORY_LIST, cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { PostListItem } from "@/lib/posts";

interface PostCardProps {
  post: PostListItem;
  size?: "sm" | "md" | "lg";
  className?: string;
  index?: number;
}

export function PostCard({ post, size = "md", className, index = 0 }: PostCardProps) {
  const category = CATEGORY_LIST.find((c) => c.slug === post.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative card-hover", className)}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block h-full overflow-hidden rounded-3xl border border-border bg-surface/60 transition-all hover:border-foreground/30"
      >
        <div className={cn("relative overflow-hidden", size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]")}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading={index < 3 ? "eager" : "lazy"}
          />
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            {category && (
              <Badge>
                <span className="mr-0.5">{category.emoji}</span>
                {category.name}
              </Badge>
            )}
            {post.featured && size !== "sm" && <Badge variant="accent">Featured</Badge>}
          </div>
          <span className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className={cn("p-5 lg:p-6", size === "lg" && "p-7 lg:p-8")}>
          <div className="flex items-center gap-3 text-xs text-muted">
            <time dateTime={String(post.publishedAt)}>
              {post.publishedAt ? formatDate(post.publishedAt) : ""}
            </time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime}
            </span>
          </div>

          <h3
            className={cn(
              "mt-3 font-serif font-semibold tracking-tight text-balance text-foreground",
              size === "lg" ? "text-3xl lg:text-4xl" : size === "sm" ? "text-lg" : "text-2xl"
            )}
          >
            {post.title}
          </h3>

          {size !== "sm" && (
            <p className="mt-3 line-clamp-2 text-pretty text-muted">
              {post.excerpt}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <span>{post.author.name}</span>
            </div>
            <span className="text-xs text-muted">
              {Intl.NumberFormat("en", { notation: "compact" }).format(post.views)} reads
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
