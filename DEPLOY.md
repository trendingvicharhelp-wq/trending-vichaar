# Deploying Trending Vichaar (free stack)

**Stack:** Vercel (site, free) · MongoDB Atlas (database, free) · GitHub Actions
(daily content agent, free). Total cost: **₹0** — the AI runs on Google
Gemini's free tier.

Everything in the repo is already prepared. You just do the account steps below.

---

## 0. Push the repo to GitHub (once)

The repo is already git-initialised with a first commit. Create an empty GitHub
repo, then:

```bash
git remote add origin https://github.com/<you>/trending-vichaar.git
git branch -M main
git push -u origin main
```

> `.gitignore` already excludes `.env.local`, so your secrets are NOT pushed.

---

## 1. MongoDB Atlas (database) — free

1. Create a free account at <https://www.mongodb.com/atlas> and a **free M0**
   cluster.
2. **Database Access** → add a user (username + password).
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere) so Vercel and
   GitHub Actions can connect.
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/trending-vichaar`
   Add the db name (`/trending-vichaar`) before the `?`.

Keep this string — it's your `MONGODB_URI`.

---

## 2. Deploy the site on Vercel — free

1. Go to <https://vercel.com>, sign in with GitHub, **Add New → Project**, and
   import your repo. Vercel auto-detects Next.js — no build config needed.
2. Before deploying, add **Environment Variables** (Settings → Environment
   Variables). Use the same values everywhere:

   | Name | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas string from step 1 |
   | `GEMINI_API_KEY` | your free Gemini key from aistudio.google.com |
   | `JWT_SECRET` | a long random string (`openssl rand -base64 32`) |
   | `AGENT_TRIGGER_SECRET` | another long random string |
   | `NEXT_PUBLIC_SITE_URL` | your live URL, e.g. `https://trending-vichaar.vercel.app` |

3. **Deploy.** Your site is live. (Re-deploys happen automatically on every
   `git push`.)
4. (Optional) Seed the admin user + sample posts once, from your machine:
   `MONGODB_URI=... npm run seed`.

> Note: the `vercel.json` cron in this repo works only on Vercel's **Pro** plan
> (free functions cap at 60s, too short for the multi-minute agent run). On the
> free plan we run the agent from GitHub Actions instead — step 3.

---

## 3. Daily auto-publish via GitHub Actions — free

The workflow at `.github/workflows/daily-agent.yml` runs the agent every day at
**21:00 IST (15:30 UTC)** and publishes one post. It needs the same secrets.

1. In your GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret**, and add each of these:
   `MONGODB_URI`, `GEMINI_API_KEY`, `JWT_SECRET`, `AGENT_TRIGGER_SECRET`,
   `NEXT_PUBLIC_SITE_URL`.
2. That's it. The job runs daily on the **default branch**.
3. **Test it now:** repo → **Actions → Daily Content Agent → Run workflow**.
   Watch the logs; a successful run prints the published URL. Refresh your live
   site to see the new post.

> GitHub Actions scheduled jobs only run on the default branch and may start a
> few minutes late under load — both fine for a daily post.

---

## 4. Verify

- Visit your Vercel URL → posts render (sample data until the first agent run).
- Run the Action once → a fresh AI post appears on the site and at
  `/api/agent/logs` (send header `x-agent-secret: <AGENT_TRIGGER_SECRET>`).
- Contact details show on `/contact` and in the footer.

---

## Alternative: Firebase

Firebase **App Hosting** can run this app too, but it needs the **Blaze**
(billing-enabled) plan plus **Cloud Scheduler** for the daily job — more setup
with no benefit over the free Vercel + Actions stack above. Ask if you want the
Firebase App Hosting config (`apphosting.yaml` + Cloud Scheduler command)
instead.

---

## What needs your accounts (can't be automated for you)

- Pushing to **your** GitHub repo.
- Creating the **Vercel** project and **Atlas** cluster (your logins).
- Entering the **secret values** (your keys) in Vercel + GitHub — never commit
  them or share them.

Everything else (workflow, config, code) is already in the repo.
