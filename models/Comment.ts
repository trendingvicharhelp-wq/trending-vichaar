import { Schema, model, models, type Model } from "mongoose";

export interface IComment {
  _id: string;
  postSlug: string;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postSlug: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    content: { type: String, required: true, maxlength: 2000 },
    approved: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Comment: Model<IComment> = models.Comment || model<IComment>("Comment", CommentSchema);
