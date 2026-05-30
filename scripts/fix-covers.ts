/* eslint-disable no-console */
/** One-off: give existing posts a real AI cover image (Pollinations, free). */
import "@/lib/agents/load-env";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";

function aiCover(text: string): string {
  const t = text.replace(/\s+/g, " ").trim().slice(0, 480);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    t
  )}?width=1600&height=900&nologo=true&model=flux`;
}

(async () => {
  await connectDB();
  const posts = await Post.find({}, "title slug coverImage").lean();
  for (const p of posts) {
    const prompt = `${p.title}. Modern editorial digital illustration, vibrant gradient, clean premium blog hero image, no text, no words`;
    const cover = aiCover(prompt);
    await Post.updateOne({ _id: p._id }, { $set: { coverImage: cover, "seo.ogImage": cover } });
    console.log(`updated cover: ${p.slug}`);
  }
  console.log(`Done — ${posts.length} posts updated.`);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
