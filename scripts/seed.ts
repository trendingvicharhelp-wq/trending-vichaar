/* eslint-disable no-console */
import "@/lib/agents/load-env"; // load .env.local (Next convention) before reading env
import mongoose from "mongoose";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { SAMPLE_POSTS } from "../lib/sample-data";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const email = process.env.ADMIN_EMAIL || "admin@trendingvichaar.com";
  const password = process.env.ADMIN_PASSWORD || "changeme123";
  const name = process.env.ADMIN_NAME || "Admin";

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ email, password, name, role: "admin" });
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  const existing = await Post.countDocuments();
  if (existing === 0) {
    const docs = SAMPLE_POSTS.map(({ _id, createdAt, updatedAt, ...rest }) => rest);
    await Post.insertMany(docs);
    console.log(`Seeded ${docs.length} posts`);
  } else {
    console.log(`Skipping post seed — ${existing} posts already exist`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
