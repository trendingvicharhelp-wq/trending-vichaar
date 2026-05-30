/* eslint-disable no-console */
/** Quick read-only check: list every post in the database. */
import "@/lib/agents/load-env";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";

(async () => {
  await connectDB();
  const posts = await Post.find({}, "title slug category status publishedAt readingTime")
    .sort({ createdAt: -1 })
    .lean();
  console.log(`TOTAL POSTS IN DB: ${posts.length}\n`);
  for (const p of posts) {
    console.log(`- [${p.status}] "${p.title}"  →  /blog/${p.slug}  [${p.category}] ${p.readingTime || ""}`);
  }
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
