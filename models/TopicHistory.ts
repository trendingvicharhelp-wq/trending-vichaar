import { Schema, model, models, type Model } from "mongoose";

/**
 * One row per topic the agent has committed to. Used to prevent the pipeline
 * from repeating itself: the topic-selection agent is shown recent titles, and
 * the orchestrator rejects near-duplicate titles before writing.
 */
export interface ITopicHistory {
  _id: string;
  title: string;
  slug: string;
  category: string;
  primaryKeyword: string;
  /** Normalised word-set of the title, for cheap similarity checks. */
  titleTokens: string[];
  runId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TopicHistorySchema = new Schema<ITopicHistory>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    primaryKeyword: { type: String, default: "" },
    titleTokens: { type: [String], default: [] },
    runId: { type: String, required: true },
  },
  { timestamps: true }
);

TopicHistorySchema.index({ createdAt: -1 });

export const TopicHistory: Model<ITopicHistory> =
  models.TopicHistory || model<ITopicHistory>("TopicHistory", TopicHistorySchema);
