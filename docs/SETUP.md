# Setup Guide — Brightwheel AI Front Desk Prototype

One-time setup for external services. Do these before writing code.

## 1. Anthropic API (LLM)

1. Go to https://console.anthropic.com
2. Sign in (same credentials as claude.ai work here)
3. Billing → **Add payment method** → load **$5** of credits
4. API Keys → **Create Key** → name it `brightwheel-frontdesk`
5. **Copy the key immediately** — starts with `sk-ant-api03-...`. You cannot view it again.
6. Save it for later; goes into `.env.local` as:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

## 2. Supabase (Postgres database)

### Create account + project
1. Go to https://supabase.com → **Start your project**
2. Sign in with **GitHub** (easiest — reuses your existing identity)
3. **New Project**
   - Name: `brightwheel-frontdesk`
   - Database password: generate a strong one, **save in a password manager**
   - Region: pick the closest one (e.g., `us-west-1`)
   - Plan: **Free**
4. Wait ~2 min for provisioning

### Get the connection details
Once the project is ready:

1. Left sidebar → **Project Settings** (gear icon) → **API Keys**
2. Copy these three values for `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # browser-safe; respects RLS
   SUPABASE_SECRET_KEY=sb_secret_...                         # server-only; bypasses RLS
   ```
   > The older `anon` and `service_role` JWT keys still work but are marked legacy — prefer the new **publishable** / **secret** keys.
3. Also grab the Postgres connection string for raw SQL access:
   **Project Settings → Database → Connection string → URI**
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Enable the vector extension (for RAG)
Supabase supports `pgvector` out of the box but it needs to be toggled on:

1. Left sidebar → **Database** → **Extensions**
2. Search `vector` → toggle **on**

### Where to browse data during development
- **Table Editor** (left sidebar) — spreadsheet-like view of all tables. Useful during the demo to show the question log populating live.
- **SQL Editor** — run ad-hoc queries.
- **Logs** — see every DB request; handy for debugging.

## 3. Vercel (hosting)

1. Go to https://vercel.com → **Sign Up** with **GitHub** (same account as Supabase)
2. No project to create yet — we'll connect the repo once code exists
3. Free **Hobby** plan is all we need; no payment method required

## 4. GitHub repo

If you don't already have one for this project:

1. https://github.com/new
2. Name: `brightwheel-frontdesk` (private is fine)
3. Don't initialize with a README — we'll push from local

## 5. Local `.env.local` template

Create this file at the project root once the Next.js app is scaffolded. **Never commit it** (it's in `.gitignore` by default).

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
DATABASE_URL=postgresql://postgres:...@db.xxxxx.supabase.co:5432/postgres
```

## 6. Deploying to Vercel (later)

When ready:

1. Push code to GitHub
2. Vercel dashboard → **Add New Project** → import the GitHub repo
3. Framework preset: Next.js (auto-detected)
4. **Environment Variables** — paste every line from `.env.local` into the UI
5. **Deploy**. ~60 seconds later you'll have a live URL like `brightwheel-frontdesk.vercel.app`.

Every subsequent `git push` triggers a fresh deploy automatically.

---

## Pre-flight checklist

- [ ] Anthropic API key created ($5 loaded)
- [ ] Supabase project created, URL + keys copied
- [ ] Supabase `vector` extension enabled
- [ ] Vercel account created (GitHub login)
- [ ] GitHub repo created
