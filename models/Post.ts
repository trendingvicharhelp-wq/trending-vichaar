import { Schema, model, models, type Model, Types } from "mongoose";

export interface IPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  status: "draft" | "scheduled" | "published";
  publishedAt: Date | null;
  scheduledFor: Date | null;
  featured: boolean;
  views: number;
  likes: number;
  readingTime: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    author: {
      name: { type: String, required: true },
      avatar: String,
      bio: String,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date, default: null, index: true },
    scheduledFor: { type: Date, default: null },
    featured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    readingTime: { type: String, default: "5 min read" },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },
  },
  { timestamps: true }
);

PostSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });

export const Post: Model<IPost> = models.Post || model<IPost>("Post", PostSchema);
