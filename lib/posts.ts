import { connectDB } from "@/lib/db";
import { Post, type IPost } from "@/models/Post";
import { getSamplePosts } from "@/lib/sample-data";

export type PostListItem = Pick<
  IPost,
  | "_id"
  | "title"
  | "slug"
  | "excerpt"
  | "coverImage"
  | "category"
  | "tags"
  | "author"
  | "publishedAt"
  | "featured"
  | "views"
  | "likes"
  | "readingTime"
>;

async function tryMongo<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.MONGODB_URI) return fallback;
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    console.warn("[posts] Mongo unavailable, using sample data:", (err as Error).message);
    return fallback;
  }
}

const PUBLIC_FIELDS =
  "_id title slug excerpt coverImage category tags author publishedAt featured views likes readingTime";

function toListItem(p: any): PostListItem {
  return JSON.parse(JSON.stringify(p));
}

export interface ListPostsOptions {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  skip?: number;
  sort?: "latest" | "trending" | "popular";
  excludeSlug?: string;
}

export async function listPosts(opts: ListPostsOptions = {}): Promise<PostListItem[]> {
  const {
    category,
    tag,
    search,
    featured,
    limit = 12,
    skip = 0,
    sort = "latest",
    excludeSlug,
  } = opts;

  const fallback = (): PostListItem[] => {
    let items = getSamplePosts().filter((p) => p.status === "published");
    if (category) items = items.filter((p) => p.category === category);
    if (tag) items = items.filter((p) => p.tags.includes(tag));
    if (featured) items = items.filter((p) => p.featured);
    if (excludeSlug) items = items.filter((p) => p.slug !== excludeSlug);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    items.sort((a, b) => {
      if (sort === "popular") return b.views - a.views;
      if (sort === "trending") return b.likes + b.views * 0.1 - (a.likes + a.views * 0.1);
      return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
    });
    return items.slice(skip, skip + limit).map(toListItem);
  };

  return tryMongo(async () => {
    const query: Record<string, any> = { status: "published" };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (featured) query.featured = true;
    if (excludeSlug) query.slug = { $ne: excludeSlug };
    if (search) query.$text = { $search: search };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      latest: { publishedAt: -1 },
      popular: { views: -1 },
      trending: { likes: -1, views: -1 },
    };

    const docs = await Post.find(query, PUBLIC_FIELDS)
      .sort(sortMap[sort])
      .skip(skip)
      .limit(limit)
      .lean();
    return docs.map(toListItem);
  }, fallback());
}

export async function countPosts(filter: { category?: string; search?: string } = {}) {
  const fallback = () => {
    let items = getSamplePosts().filter((p) => p.status === "published");
    if (filter.category) items = items.filter((p) => p.category === filter.category);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }
    return items.length;
  };

  return tryMongo(async () => {
    const query: Record<string, any> = { status: "published" };
    if (filter.category) query.category = filter.category;
    if (filter.search) query.$text = { $search: filter.search };
    return Post.countDocuments(query);
  }, fallback());
}

export async function getPostBySlug(slug: string): Promise<IPost | null> {
  const fallback = (): IPost | null => {
    const found = getSamplePosts().find((p) => p.slug === slug);
    return found ? (JSON.parse(JSON.stringify(found)) as IPost) : null;
  };

  return tryMongo(async () => {
    const doc = await Post.findOne({ slug, status: "published" }).lean();
    return doc ? (JSON.parse(JSON.stringify(doc)) as IPost) : null;
  }, fallback());
}

export async function getAdjacentPosts(slug: string) {
  const all = await listPosts({ limit: 100, sort: "latest" });
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export async function incrementViews(slug: string) {
  if (!process.env.MONGODB_URI) return;
  try {
    await connectDB();
    await Post.updateOne({ slug }, { $inc: { views: 1 } });
  } catch {}
}

export async function getCategoriesWithCounts() {
  const fallback = () => {
    const counts: Record<string, number> = {};
    for (const p of getSamplePosts()) {
      if (p.status !== "published") continue;
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  };

  return tryMongo(async () => {
    const agg = await Post.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const counts: Record<string, number> = {};
    agg.forEach((a) => (counts[a._id] = a.count));
    return counts;
  }, fallback());
}
