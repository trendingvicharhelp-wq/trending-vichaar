/* eslint-disable no-console */
/**
 * Re-assign auto-generated cover images using the current coverImageFor()
 * pools. Run after changing the cover provider or adding photos to a pool.
 *
 * Only touches covers the agent generated (dead LoremFlickr URLs, or Unsplash
 * URLs in the exact auto-generated format) — covers set by hand in the admin
 * panel are never overwritten.
 */
import "@/lib/agents/load-env";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { coverImageFor } from "@/lib/agents/config";

const AUTO_COVER = /loremflickr\.com|^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?w=1600&h=900&fit=crop&q=80&auto=format$/;

(async () => {
  await connectDB();
  const posts = await Post.find({ coverImage: AUTO_COVER }, "slug category coverImage").lean();
  let changed = 0;
  for (const p of posts) {
    const cover = coverImageFor(p.category, p.slug);
    if (cover === p.coverImage) continue;
    await Post.updateOne({ _id: p._id }, { $set: { coverImage: cover, "seo.ogImage": cover } });
    changed++;
    console.log(`updated cover: ${p.slug} [${p.category}]`);
  }
  console.log(`Done — ${changed} of ${posts.length} auto-generated covers updated.`);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
