# Brightwheel AI Front Desk — Project Plan

Take-home prototype for a Brightwheel engineering interview. Three days. One polished demo.

## The pitch in one sentence

An embeddable AI chat widget that daycares drop onto their website so parents get trustworthy, grounded answers 24/7 — and every fuzzy answer automatically teaches the system to do better tomorrow.

## Strategic angle

**Depth + Novelty, with enough breadth to feel real.**

Not trying to handle every question. Trying to handle a realistic set *extremely well*, with a visible feedback loop that shows how the system improves. The narrative that wins: "a parent gets a trustworthy answer at 9pm, and the operator sees the gap the next morning with a one-click fix."

## Product concept

Two surfaces, shipped together:

### 1. Public — "The Slow Cooker" demo site (`/` + `/chat`)
A real-feeling marketing site for a fictional daycare. Deliberately fact-free (no hours, tuition, policies, address) — any factual question about the center must go through the chat. This is the product thesis made visible in negative space.

**Chat lives at `/chat`** (originally planned as a floating bubble, pivoted to a dedicated route): a Navbar link points there, the page is a full-height chat UI. Every response is RAG-grounded with inline `[§ Section Title]` citations so the trust story is verifiable.

### 2. Operator dashboard (`/admin`)
Where center staff manage the source of truth and see what parents are asking.

## Stack decisions (locked)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Vercel-native, API routes for LLM calls, SSR where useful |
| Styling | **Tailwind CSS** | Maximum flexibility, no lock-in to a library's look |
| Components | **shadcn/ui** | Copy-into-repo components we own and freely modify |
| Animation | **Framer Motion** | Chat bubble transitions, message fade-ins — polish |
| Fonts | **Geist** (sans) + a friendly display face (e.g., Fraunces) for the Slow Cooker | Warm but modern |
| LLM | **Claude Sonnet 4.6** (answers) + **Haiku 4.5** (intent classification, cheap background tasks) | Best quality where it matters, cheap where it doesn't |
| Voice input | **Web Speech API** | Free, no infra, real accessibility value |
| DB | **Supabase** (Postgres + pgvector) | Real Postgres, nice table editor for live demo, free tier |
| Hosting | **Vercel** (default `*.vercel.app` URL, no custom domain) | Zero-friction deploys |

**Deferred / cut:**
- TTS voice output (scoped out)
- Custom domain (not needed)
- Auth (single fake operator — not worth the demo time)

## Scope

### Parent chat
- [x] ~~Floating bubble → expanding chat panel~~ — **pivoted: dedicated `/chat` route** reached via a quiet Navbar link. Honest navigation, no hollow CTAs on the marketing page.
- [x] Text input (Enter-to-send, Shift-Enter for newline)
- [ ] Voice input (Web Speech API) — deferred
- [ ] Suggested opener chips, time-aware (Friday → weekend menu, morning → late-start) — deferred
- [~] Streaming answers with **inline citations** to handbook sections — text markers (`[§ Section Title]`) are present in responses; UI-rendering them as clickable anchors is deferred (was phase 5c)
- [ ] Confidence-aware responses:
  - High → direct answer + citation
  - Medium → answer + "want me to confirm with staff?"
  - Low/sensitive → graceful handoff, logs the question
- [ ] Sensitive intent routing (phase 7):
  - Illness symptoms → policy + "notify teacher" CTA
  - Enrollment/tours → structured lead capture
  - Emergencies → "call 911 / call center" escalation, no LLM
- [ ] Spanish detection + Spanish responses

### Operator dashboard (phase 8+)
- [ ] Overview: questions today, auto-resolved %, escalations, top topics, estimated time saved
- [ ] Handbook editor (markdown, sectioned, versioned by timestamp)
- [ ] Question log with filters (escalated, low-confidence, by topic)
- [ ] **Knowledge gap detector** — groups similar unanswered questions, LLM drafts handbook additions from them. One-click to merge. *This is the moment that sells the product.*
- [ ] Lead inbox (captured tour requests)

### Content
- [x] Handbook: 15 sections covering hours, holidays, tuition, illness (24-hr fever-free), meals, tours, pickup, immunizations, weather closures, curriculum — adapted from City of Albuquerque Division of Child & Family Development Family Handbook
- [x] Two personality touches: director's note (Maria Hernández), plus three traditions (Muffin Mornings, Garden Harvest, Butterfly Release)
- [ ] ~30 seeded historical questions for the demo so the operator view isn't empty — deferred to phase 10

## Build order

1. ✅ **Setup** — SETUP.md checklist complete
2. ✅ **Scaffold** — Next.js 15 + Tailwind v4 + shadcn/ui + Supabase client, bun, Vitest
3. ✅ **Handbook content** — 15 sections adapted from the ABQ Division of Child & Family Development Family Handbook
4. ✅ **Landing page** — Slow Cooker editorial-adobe marketing site (Fraunces + Geist, terracotta accent, paper-grain)
5. ✅ **Chat UI** — dedicated `/chat` route with message list, streaming input, and back-to-home header *(originally framed as a floating bubble; pivoted to a full-page route)*
6. ✅ **RAG pipeline** — `lib/rag/{chunk,retrieve,answer}` + `lib/voyage/embed`, Supabase pgvector (HNSW), Voyage voyage-4-lite asymmetric embeddings, Claude Sonnet 4.6 streaming with prompt caching, `[§ Section]` citation markers
7. **Intent classifier** — route sensitive/emergency/lead cases before RAG
8. **Operator dashboard** — handbook editor, question log, overview
9. **Knowledge gap detector** — the wow moment
10. **Seed data + polish** — animations, empty states, error states, ~30 historical questions
11. **Eval sweep** — 20 test questions, iterate prompts until ≥18 feel great
12. **Deploy** — ✅ already live at `brightwheelfrontdesk.vercel.app` with GitHub auto-deploy; remaining: real-phone smoke test
13. **Loom demo** — tight 90-sec script, no rambling

## Day-by-day

**Day 1 — Foundation**
- Accounts set up (SETUP.md)
- Repo scaffolded, deployed to Vercel (empty page) to de-risk hosting
- Handbook written
- Landing page shell

**Day 2 — Two surfaces**
- Chat widget UI + RAG pipeline working end-to-end with citations
- Intent routing for sensitive cases
- Operator dashboard: handbook editor + question log
- Spanish support

**Day 3 — Novelty + polish**
- Knowledge gap detector
- Lead capture
- Seed data, animations, empty/error states
- Eval sweep + prompt iteration
- Loom recording

## Deliverables

- **Hosted URL** (Vercel) with seeded demo data, works on mobile
- **~90-sec Loom** — problem → parent asks 3 questions (incl. voice + Spanish) → operator sees gap → one-click handbook update → parent re-asks, now answered
- **1-page doc** — problem framing, what was built, tradeoffs, what's next

## Evaluation rubric (from the brief) — how to score well

| Criterion | Strategy |
|---|---|
| Scope & completeness | Polished depth over hasty breadth. Show one flywheel working end-to-end. |
| Persuasiveness | The landing page is deliberately fact-free; every factual question must go through `/chat`, which makes the chat the product. |
| User empathy | Voice input, Spanish, time-aware suggestions, clear escalation. Show we thought about real conditions. |
| Uniqueness | The knowledge gap detector. Genuinely rare in this space. |

## Open risks

- **Retrieval quality**: if citations don't feel accurate, the whole trust story collapses. Budget eval time.
- **Prompt consistency**: streaming + citations + confidence is a lot to ask of one prompt. May need a two-pass pattern (retrieve → draft → verify citations).
- **Time on polish vs. substance**: resist spending Day 3 on pixel-pushing if the gap detector isn't solid yet.

## Notes for resuming later

- Check `SETUP.md` for account/key setup
- This file is the source of truth for scope decisions; update it when anything changes
- When returning after a break, skim the build order checklist to see what's next
