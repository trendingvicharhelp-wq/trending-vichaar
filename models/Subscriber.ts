import { Schema, model, models, type Model } from "mongoose";

export interface ISubscriber {
  _id: string;
  email: string;
  source?: string;
  createdAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Subscriber: Model<ISubscriber> =
  models.Subscriber || model<ISubscriber>("Subscriber", SubscriberSchema);
