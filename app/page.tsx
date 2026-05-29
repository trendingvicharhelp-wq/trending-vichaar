import { Hero } from "@/components/home/Hero";
import { FeaturedSlider } from "@/components/home/FeaturedSlider";
import { TrendingMarquee } from "@/components/home/TrendingMarquee";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { LatestGrid } from "@/components/home/LatestGrid";
import { AiDesignHighlights } from "@/components/home/AiDesignHighlights";
import { Newsletter } from "@/components/home/Newsletter";
import {
  listPosts,
  getCategoriesWithCounts,
} from "@/lib/posts";

export const revalidate = 60;

export default async function HomePage() {
  const [featuredAll, latest, trending, aiPosts, designPosts, counts] =
    await Promise.all([
      listPosts({ featured: true, limit: 5 }),
      listPosts({ limit: 6, sort: "latest" }),
      listPosts({ limit: 8, sort: "trending" }),
      listPosts({ category: "ai-tools", limit: 4 }),
      listPosts({ category: "graphic-design", limit: 4 }),
      getCategoriesWithCounts(),
    ]);

  const heroPost = featuredAll[0] ?? latest[0];

  if (!heroPost) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-serif text-display-lg">No posts yet</h1>
        <p className="mt-4 text-muted">
          Run <code>npm run seed</code> or publish your first piece from the
          admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <>
      <Hero featured={heroPost} />
      <TrendingMarquee posts={trending} />
      <FeaturedSlider posts={featuredAll.length > 1 ? featuredAll : latest.slice(0, 4)} />
      <CategoriesGrid counts={counts} />
      <LatestGrid posts={latest} />
      <AiDesignHighlights ai={aiPosts} design={designPosts} />
      <Newsletter />
    </>
  );
}
