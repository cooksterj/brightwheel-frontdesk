# Brightwheel Front Desk

A take-home prototype for a Brightwheel. A fictional daycare ("The Slow Cooker") runs a deliberately fact-free marketing site, so every factual question a parent has (tuition, illness policy, hours, meals) has to go through the chat at `/chat`. The chat answers with citations to the center's handbook, logs every question, and surfaces the ones it couldn't answer well to the operator at `/admin/gaps`, where a one-click merge drafts a new handbook section.

- **Live:** https://brightwheelfrontdesk.vercel.app
- **Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (five Mermaid diagrams)
- **Setup details:** [`docs/SETUP.md`](docs/SETUP.md)
- **Commands:** [`docs/COMMANDS.md`](docs/COMMANDS.md)

## Contents

- [Demonstration](#demonstration)
- [The stack](#the-stack)
- [Handbook content](#handbook-content)
- [Quickstart](#quickstart)
  - [1. Clone and install](#1-clone-and-install)
  - [2. External accounts](#2-external-accounts)
  - [3. Environment](#3-environment)
  - [4. Apply the Supabase migrations](#4-apply-the-supabase-migrations)
  - [5. Seed](#5-seed)
  - [6. Run](#6-run)
- [Daily commands](#daily-commands)
- [Repository layout](#repository-layout)
- [Safety posture (for a demo)](#safety-posture-for-a-demo)
- [What's not here (by design, or deferred)](#whats-not-here-by-design-or-deferred)
- [What can be improved](#what-can-be-improved)

## Demonstration

### Base chat functionality - parent experience

Three questions:
1. Tuition based
2. A likely emergency scenario
3. Data that is not contained in the handbook

https://github.com/user-attachments/assets/f7d0ab30-2f0f-4526-b406-8e3ad4fb7c8e

### Editing handbook - administrator experience

Click **Admin** in the top-right of the landing page, or go directly to **https://brightwheelfrontdesk.vercel.app/admin/**.

The application handles edits to the handbook and they are immediately applied to be chat ready:

https://github.com/user-attachments/assets/609ac5dd-4ff3-4dcc-9a3c-b37f8ebb77d7

### Knowledge Gaps - administrator experience

Click **Admin** in the top-right of the landing page, or go directly to **https://brightwheelfrontdesk.vercel.app/admin/**.

When a parent question has a low match against the handbook, it's logged and surfaced to administrators. Each gap comes with a drafted section the admin can edit or accept outright, and merging it takes effect immediately: the chat uses the updated handbook on the very next question. For example, after the food question was merged, it no longer appeared as an open knowledge gap.

https://github.com/user-attachments/assets/15784f8f-0e30-436e-bef1-71ec9d276f7d

## The stack

- **Next.js 15** App Router on **Vercel**
- **Tailwind v4** with an editorial-adobe palette (Fraunces + Geist)
- **Supabase Postgres + pgvector** for handbook and question storage
- **Voyage AI** `voyage-4-lite` for asymmetric embeddings (document + query)
- **Claude Sonnet 4.6** for grounded parent answers (prompt-cached handbook context)
- **Claude Haiku 4.5** for intent classification and gap-section drafting
- **bun** as the package manager and script runner, **Vitest** for tests

## Handbook content

The seed handbook lives at [`content/handbook/slow-cooker.md`](content/handbook/slow-cooker.md). It's 15 H2 sections (hours, tuition, illness, meals, curriculum, director's note, traditions, etc.) written in the voice of a fictional Albuquerque daycare called "The Slow Cooker."

The policies are adapted from the [City of Albuquerque Division of Child & Family Development Family Handbook](https://www.cabq.gov/family/documents/2019-division-of-child-and-family-development-family-handbook-final.pdf) (Revised April 2019), which the take-home brief specifically recommended as a realistic reference. Names, branding, specific prices, and the director's biography are invented; the regulatory framing (NM CYFD licensing, USDA CACFP, 24-hour fever-free rule, NMSA 24-5-3 immunization exemption) traces back to the source.

After the first `just seed`, the database becomes the source of truth and the markdown file is no longer canonical. Operator edits made at `/admin/handbook` persist in Postgres; re-running `just seed` would overwrite those edits back to the markdown baseline.

## Quickstart

### 1. Clone and install

```bash
git clone https://github.com/cooksterj/brightwheel-frontdesk
cd brightwheel-frontdesk
bun install
```

### 2. External accounts

The full checklist is in [`docs/SETUP.md`](docs/SETUP.md). You'll need:

| Service | Why | Free tier |
|---|---|---|
| [Anthropic](https://console.anthropic.com) | Claude Sonnet 4.6 (answers) + Haiku 4.5 (classification, drafting) | pay-per-call; set a monthly spend cap |
| [Voyage AI](https://dashboard.voyageai.com) | Embeddings for RAG + gap detection | 200M tokens on `voyage-4-lite` |
| [Supabase](https://supabase.com) | Postgres + pgvector | free tier |
| [Vercel](https://vercel.com) | Hosting + auto-deploy | Hobby |

### 3. Environment

Copy `.env.example` to `.env.local` and fill in the values from the dashboards above:

```bash
cp .env.example .env.local
```

### 4. Apply the Supabase migrations

In the Supabase dashboard, go to **SQL Editor**, paste each file in order, and run:

```text
supabase/migrations/0001_handbook.sql           # handbook_sections + pgvector + RPC
supabase/migrations/0002_questions.sql          # questions log + RPC
supabase/migrations/0003_questions_resolved.sql # resolved_at for gap detector
supabase/migrations/0004_questions_intent.sql   # intent column for routing
```

### 5. Seed

```bash
just seed             # parse handbook.md, embed, insert 15 sections
just seed-questions   # 30 synthetic parent questions for the operator view
```

### 6. Run

```bash
just dev          # Next.js dev server on :3000
```

- `/`: marketing page (fact-free; chat is the product)
- `/chat`: parent chat
- `/admin/handbook`: edit policies (saves re-embed + snapshot the previous version)
- `/admin/gaps`: clustered unanswered questions + one-click merge

## Daily commands

```bash
just          # list every recipe with a one-liner
just check    # typecheck + Vitest + production build (pre-push gate)
just check-dev # same, but safe while `just dev` is running
just prod     # curl the production URL, check health + content markers
```

Full catalog in [`docs/COMMANDS.md`](docs/COMMANDS.md).

## Repository layout

```
app/              # routes: marketing, /chat, /admin/*, /api/*
  api/chat        # parent-facing chat endpoint (intent, RAG, stream)
  api/admin       # operator endpoints (handbook save, gaps, merge)
components/
  marketing/      # landing page sections
  chat/           # message list, input, streaming client hook
  admin/          # handbook editor, gap detector UI
lib/
  env.ts          # zod-validated env access
  rag/            # chunk, retrieve, answer, classify-intent, cluster, propose-section, confidence, log
  handbook/       # repo, reembed, create-section
  voyage/         # embeddings client
  supabase/       # server admin client
  security/       # origin allowlist + request size caps
  chat/           # streaming reader + types
content/handbook/ # the seed markdown (DB is source of truth after first seed)
supabase/migrations/ # numbered SQL; paste each into the SQL Editor once
scripts/          # seed-handbook, seed-questions
docs/             # ARCHITECTURE, COMMANDS, SETUP
```

Design principles: small single-purpose files, I/O behind thin adapters, colocated tests.

## Safety posture (for a demo)

- Anthropic monthly spend cap set in the console (hard stop on runaway cost)
- Origin allowlist on mutating API routes (prod, preview, localhost)
- Request-size caps per message (1k chars) and per conversation (20k / 40 messages)
- `/admin/*` is `robots: noindex` but **has no auth**. Obscurity-only, sufficient for a private-link demo.
- Whole site is blocked from search and LLM training crawlers via `public/robots.txt` (`Disallow: /`). It's a politeness signal; see the file's header comment for why it's there.

## What's not here (by design, or deferred)

- No voice input, no non-English detection.
- No admin auth (one private URL, one reviewer).
- No Upstash rate limiter (spend cap + origin check cover realistic risk).

## What can be improved

- **Duplicate handbook terminology drift.** If the same fact lives in two handbook sections, editing one can cause the chat to cite the stale one. Known proof-of-concept limitation; a duplicate-fact detector in the editor would close it.
- **Smarter gap clustering.** Replace threshold-based cosine clustering with an LLM-driven grouping pass for the gap detector, or upgrade to a higher-quality embedding model (voyage-4 over voyage-4-lite).
- **Dedicated intent classifier.** Swap the Haiku-with-prompt classifier for a fine-tuned or dedicated intent model, and focus the tuning on recall for emergency (false negatives are worse than false positives here).
- **Installable widget.** Package the chat as an embeddable widget so daycares can drop it onto their existing site. This would require multi-tenant isolation so one daycare's handbook can't leak into another's retrieval.
- **AWS-native option.** Consolidate on AWS for enterprise customers who need a single billing / compliance surface: Amplify or ECS for hosting, RDS Postgres + pgvector, and Bedrock for both Titan (embeddings) and Claude (answers).
