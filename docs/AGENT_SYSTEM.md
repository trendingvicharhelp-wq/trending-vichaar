# Trending Vichaar — Autonomous AI Content Agent

A self-driving content pipeline that researches, writes, SEO-optimises, and
publishes **one evergreen blog post every day at 9:00 PM IST** — no human in the
loop. Built on the Claude API, Next.js, Node.js, and MongoDB.

---

## 1. Architecture

Nine specialised agents run as a deterministic pipeline. Each agent is a small,
typed module under `lib/agents/steps/`; the **orchestrator** wires them together
and owns retries, dedup, scoring, and run bookkeeping.

```
                          ┌─────────────────────────────┐
   Cron (9PM IST) ───────▶│        orchestrator         │
   /api/agent/run         │  (runId, retries, logging)  │
   npm run agent          └──────────────┬──────────────┘
                                         │
   1. Trend Research      ── web search ─┤  → 8–12 evergreen candidates
   2. Topic Selection     ── filter ─────┤  → 1 brand-safe topic (+ dedup)
   3. SEO Analysis        ───────────────┤  → keyword + slug + intent
   4. Deep Research       ── web search ─┤  → key points, facts, outline, FAQs
   5. Content Writer      ── Opus ───────┤  → 1500–2500-word Markdown article
   6. SEO Optimizer       ───────────────┤  → titles, meta, 10 kw, links, social
   7. Image Prompt        ───────────────┤  → featured-image prompt + alt text
      (local scoring)     ───────────────┤  → SEO score + Flesch readability
   8. Publisher           ── Mongo ──────┤  → published Post (live on the site)
   9. Analytics Tracker   ── Mongo ──────┘  → TopicHistory + AgentRun log
```

Each agent maps to the brief's STEP 1–10:

| Brief step | Where it happens |
|---|---|
| 1 Research trends (multi-source) | Trend Research (web search) |
| 2 Identify what 20–35s search | Trend Research + Topic Selection |
| 3 Filter (evergreen, SEO, demand, interest, value, safety) | Topic Selection |
| 4 Reject news/politics/crime/etc. | Topic Selection + every system prompt |
| 5 Select best topic | Topic Selection (+ orchestrator dedup) |
| 6 Deep research | Deep Research (web search) |
| 7 Generate full SEO article | Content Writer |
| 8 Keywords, links, categories, social, Pinterest | SEO Optimizer |
| 9 Featured image prompt | Image Prompt Generator |
| 10 Auto-publish | Publisher |

---

## 2. Folder structure

```
lib/agents/
  config.ts              # models, allowed categories, banned topics, schedule, retry
  types.ts               # the typed payload contract between agents
  claude.ts              # Anthropic client: callStructured / callWithWebSearch / callText
  prompts.ts             # shared brand-voice + safety system preamble (cached)
  scoring.ts             # Flesch readability + composite SEO score (no LLM)
  dedup.ts               # title tokenisation + Jaccard similarity
  logger.ts              # per-run structured logger (transcript saved to AgentRun)
  trigger-auth.ts        # secret check for the API endpoints
  orchestrator.ts        # wires the 9 steps; retries, dedup, scoring, bookkeeping
  steps/
    trend-research.ts      # STEP 1
    topic-selection.ts     # STEP 2
    seo-analysis.ts        # STEP 3
    deep-research.ts       # STEP 6
    content-writer.ts      # STEP 5/7  (writer model, streamed)
    seo-optimizer.ts       # STEP 8
    image-prompt.ts        # STEP 9
    publisher.ts           # STEP 10
    analytics-tracker.ts   # archive + logs + repetition history

models/
  Post.ts                # existing — published posts (unchanged shape)
  TopicHistory.ts        # NEW — dedup / repetition prevention
  AgentRun.ts            # NEW — publishing log + run archive + analytics

scripts/
  run-agent.ts           # manual runner (npm run agent / agent:dry)
  cron.ts                # self-hosted node-cron scheduler (npm run agent:cron)

app/api/agent/
  run/route.ts           # POST/GET trigger (Vercel Cron + manual), secret-protected
  logs/route.ts          # GET recent runs (publishing log)

vercel.json              # Vercel Cron: 15:30 UTC == 21:00 IST
docs/AGENT_SYSTEM.md     # this file
```

---

## 3. Database schema

**Post** (existing, `models/Post.ts`) — what gets published. The Publisher fills:
`title, slug, excerpt, content (Markdown), coverImage, category, tags, author,
status:"published", publishedAt, readingTime, seo{title,description,keywords}`.

**TopicHistory** (`models/TopicHistory.ts`) — one row per committed topic.

| field | purpose |
|---|---|
| `title`, `slug`, `category`, `primaryKeyword` | what was published |
| `titleTokens` | normalised word-set for cheap similarity checks |
| `runId`, `createdAt` | provenance + recency window |

**AgentRun** (`models/AgentRun.ts`) — one document per run (the publishing log).

| field | purpose |
|---|---|
| `runId`, `status`, `trigger`, `dryRun` | run identity + outcome |
| `topic, category, primaryKeyword, postId, slug, url, wordCount` | what it produced |
| `seoScore, readabilityScore, readabilityLabel` | quality metrics |
| `durationMs, error, log[]` | ops + full step transcript |
| `startedAt, finishedAt` | timing |

---

## 4. Claude API implementation

- **SDK:** `@anthropic-ai/sdk`, via `client.messages.create` / `.stream`.
- **Model split** (cost-aware daily run — override via env):
  | Job | Model | Why |
  |---|---|---|
  | Content Writer | `claude-opus-4-8` | headline quality |
  | Trend + Deep Research | `claude-sonnet-4-6` | web-search dynamic-filtering tier |
  | SEO Analysis / Optimizer | `claude-sonnet-4-6` | solid reasoning, lower cost |
  | Topic / Image / utility | `claude-haiku-4-5` | cheap, well-constrained calls |
- **Prompt caching:** the large brand/safety preamble (`prompts.ts`) is sent as a
  single `cache_control: { type: "ephemeral" }` block, so repeated daily runs pay
  the ~0.1× cache-read price on the shared prefix.
- **Web search:** the server-side `web_search_20260209` tool. The wrapper handles
  the `pause_turn` server-loop and **degrades gracefully** to model knowledge if
  the tool isn't enabled on the account.
- **Structured output:** `output_config.format` with a JSON schema per agent;
  unsupported JSON-Schema keywords are stripped centrally before sending, and the
  result is parsed defensively (`extractJson`).
- **Retry/error handling:** `withRetry` retries 429/5xx/network with exponential
  backoff (3 attempts); non-retryable errors fail fast with a clear message.

---

## 5. Features

- **Daily auto-execution** at 21:00 IST (Vercel Cron or self-hosted node-cron).
- **Brand safety** — 15 allowed categories only; an explicit ban-list is enforced
  in Topic Selection *and* reasserted in every agent's system prompt.
- **Duplicate / repetition prevention** — recent titles are shown to the selector,
  and the orchestrator rejects near-duplicates (Jaccard ≥ 0.6) and reselects.
- **SEO scoring** — 10-point composite (title/meta length, keyword placement, word
  count, heading structure, FAQs, slug).
- **Readability scoring** — Flesch Reading Ease + grade level.
- **Auto category + tagging** — assigned by the SEO Optimizer, validated against
  the site taxonomy by the Publisher.
- **Content archive + publishing logs** — every run recorded in `AgentRun`,
  every topic in `TopicHistory`; readable at `GET /api/agent/logs`.
- **Error handling + retries** — per-call retries, plus a failure record written
  to `AgentRun` so nothing fails silently.
- **Dry run** — `npm run agent:dry` (or `?dryRun=1`) runs everything except DB writes.

---

## 6. Deployment

### Prerequisites
1. **MongoDB** — set `MONGODB_URI` (Atlas or self-hosted). Required to publish.
2. **Anthropic API key** — set `ANTHROPIC_API_KEY`.
3. **Trigger secret** — set `AGENT_TRIGGER_SECRET` (any long random string).

Copy `.env.example` → `.env.local` and fill these in. Then seed the admin/sample
data once if you haven't: `npm run seed`.

### Option A — Vercel (recommended)
1. Set `MONGODB_URI`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL`, and
   `CRON_SECRET` (Vercel sends it as `Authorization: Bearer`) in Project →
   Settings → Environment Variables.
2. `vercel.json` already declares the cron:
   ```json
   { "crons": [{ "path": "/api/agent/run", "schedule": "30 15 * * *" }] }
   ```
   `30 15 * * *` UTC = **21:00 IST**.
3. Deploy. Vercel hits `/api/agent/run` daily. (Pipeline runs are multi-minute;
   the route sets `maxDuration = 300` — a Pro plan is recommended for headroom.)

### Option B — Self-hosted (VPS / Docker / always-on box)
```bash
npm install
npm run build && npm run start     # the Next.js site
npm run agent:cron                 # the scheduler process (keep alive, e.g. pm2)
```
`agent:cron` fires `runPipeline` at `AGENT_CRON` (default `0 21 * * *`) in
`Asia/Kolkata`. Run it under a supervisor (`pm2 start "npm run agent:cron"`).

### Manual / testing
```bash
npm run agent:dry     # full pipeline, NO database writes
npm run agent         # research → write → PUBLISH one post

# Or via HTTP:
curl -X POST "https://your-site.com/api/agent/run" \
  -H "Authorization: Bearer $AGENT_TRIGGER_SECRET"
curl -X POST "https://your-site.com/api/agent/run?dryRun=1" \
  -H "x-agent-secret: $AGENT_TRIGGER_SECRET"

# Publishing log:
curl "https://your-site.com/api/agent/logs?limit=10" \
  -H "x-agent-secret: $AGENT_TRIGGER_SECRET"
```

---

## 7. Tuning

Everything tunable lives in `lib/agents/config.ts` (or env overrides):
model IDs (`AGENT_MODEL_*`), schedule (`AGENT_CRON`), allowed categories,
ban-list, word-count range, retry counts, dedup window/threshold, author identity.

> **Featured images:** the pipeline generates a detailed image *prompt* (stored
> and logged) and sets a deterministic Unsplash placeholder cover. To render real
> images, feed `ImagePromptResult.featuredImagePrompt` to an image API in the
> Publisher and set `coverImage`/`seo.ogImage` to the result.
