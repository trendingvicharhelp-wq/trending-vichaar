/* eslint-disable no-console */
/** One-off: give every existing post a working, topic-relevant cover image. */
import "@/lib/agents/load-env";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { coverImageFor } from "@/lib/agents/config";

(async () => {
  await connectDB();
  const posts = await Post.find({}, "title slug category").lean();
  for (const p of posts) {
    const cover = coverImageFor(p.category, p.slug);
    await Post.updateOne({ _id: p._id }, { $set: { coverImage: cover, "seo.ogImage": cover } });
    console.log(`updated cover: ${p.slug} [${p.category}]`);
  }
  console.log(`Done — ${posts.length} posts updated.`);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
