/**
 * Side-effect module: load environment variables for standalone scripts.
 *
 * IMPORTANT: import this FIRST (before any module that reads process.env at
 * import time, e.g. lib/db.ts). ES module imports are evaluated in order, so
 * importing this first guarantees .env.local is loaded before the DB module
 * captures MONGODB_URI. (Next.js loads .env.local on its own; this is only for
 * `tsx` scripts and the cron runner.)
 */
import { config } from "dotenv";

config({ path: ".env.local" }); // Next.js convention — primary
config(); // .env fallback (won't override already-set vars)
