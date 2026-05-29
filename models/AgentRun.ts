import { Schema, model, models, type Model } from "mongoose";

/**
 * One document per pipeline run — the publishing log + content archive +
 * analytics record. The Analytics Tracker agent finalises this at the end of
 * each run; the orchestrator also writes a failure record if the run throws.
 */
export interface IAgentRun {
  _id: string;
  runId: string;
  status: "running" | "success" | "failed" | "skipped";
  trigger: "cron" | "manual" | "api";
  dryRun: boolean;

  // What was produced
  topic?: string;
  category?: string;
  primaryKeyword?: string;
  postId?: string | null;
  slug?: string;
  url?: string;
  wordCount?: number;

  // Quality
  seoScore?: number;
  readabilityScore?: number;
  readabilityLabel?: string;

  // Ops
  durationMs?: number;
  error?: string;
  /** Full step transcript for debugging. */
  log: { ts: string; level: string; step: string; message: string }[];

  startedAt: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentRunSchema = new Schema<IAgentRun>(
  {
    runId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["running", "success", "failed", "skipped"],
      default: "running",
      index: true,
    },
    trigger: { type: String, enum: ["cron", "manual", "api"], default: "manual" },
    dryRun: { type: Boolean, default: false },

    topic: String,
    category: { type: String, index: true },
    primaryKeyword: String,
    postId: { type: String, default: null },
    slug: String,
    url: String,
    wordCount: Number,

    seoScore: Number,
    readabilityScore: Number,
    readabilityLabel: String,

    durationMs: Number,
    error: String,
    log: { type: [Object], default: [] },

    startedAt: { type: Date, default: Date.now },
    finishedAt: Date,
  },
  { timestamps: true }
);

AgentRunSchema.index({ createdAt: -1 });

export const AgentRun: Model<IAgentRun> =
  models.AgentRun || model<IAgentRun>("AgentRun", AgentRunSchema);
