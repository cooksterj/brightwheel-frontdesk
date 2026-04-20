# The Slow Cooker: Reviewer's Guide

A walkthrough of the brightwheel frondesk bottleneck chat exercise functionality.

## What it is

A website for a fictional daycare called *The Slow Cooker*. Parents get a private chat where they can ask any question about the program (tuition, illness policy, hours, what's for lunch) and get a trustworthy answer with citations back to the family handbook. Operators get a dashboard where they can edit that handbook and close knowledge gaps the chat couldn't cover.

## Where to go

| What | URL |
|---|---|
| **Live site** | https://brightwheelfrontdesk.vercel.app |
| **Parent chat** | https://brightwheelfrontdesk.vercel.app/chat |
| **Operator dashboard** | https://brightwheelfrontdesk.vercel.app/admin |
| **Source code** | https://github.com/cooksterj/brightwheel-frontdesk |
| **Architecture diagrams** | [`docs/ARCHITECTURE.md`](https://github.com/cooksterj/brightwheel-frontdesk/blob/main/docs/ARCHITECTURE.md) (five Mermaid diagrams: components, chat flow, ingestion, operator flow, data model) |

> The landing page at `/` is deliberately thin. It's a warm brochure with no tuition, hours, or policies on it; every factual question must go through the chat.

## Try it as a parent

1. Open the [live site](https://brightwheelfrontdesk.vercel.app) and click **Ask us anything** in the header or hero.
2. Ask a real parent question. Suggestions:
   - *"How much is tuition for my toddler?"*
   - *"How long does my kid have to stay home after a fever?"*
   - *"Can I bring cupcakes on my child's birthday?"*
3. Watch the answer stream in. Each factual claim ends with a citation marker like `[§ Illness Policy]`, pointing back to the handbook section the answer came from.
4. Try an edge case:
   - *"My son is having a seizure, what do I do?"* The chat should skip its usual flow and route to 911 and the center's phone.
   - *"Do you offer a summer camp?"* The chat will honestly admit the handbook doesn't cover that, rather than make something up.

## Try it as an operator

1. From the [live site](https://brightwheelfrontdesk.vercel.app), click **Admin** in the top-right of the header (or go directly to [`/admin`](https://brightwheelfrontdesk.vercel.app/admin)). Three cards: **Handbook**, **Questions**, **Knowledge gaps**.
2. **Handbook:** pick any section (e.g. *Hours of Operation*), change a detail, click **Save**. Open `/chat` in another tab and ask about that detail. The chat reflects your edit on the next question.
3. **Questions:** a running log of every parent question, newest first. Four columns tell the story: *confidence* (how well the handbook matched), *intent* (how the question was routed, e.g. emergency vs. general), *cited* (which handbook sections were retrieved), and *status* (whether the question has been addressed via a gap merge). Each column has a short inline explanation at the top of the page, so you don't need to guess what anything means. Filter pills narrow to just *high*, *medium*, or *low* when you want to focus on the wins or the rough spots.
4. **Knowledge gaps:** parent questions the chat couldn't confidently answer are grouped by topic. Each group includes a proposed new handbook section. Edit the draft if you want, click **Merge as handbook section**. The new section goes live; the questions in that cluster are marked resolved and stop reappearing as gaps.

## The story the product is telling

Low-confidence questions are logged and surfaced to administrators alongside a drafted handbook section. One click merges the draft into the live handbook, and the chat picks up the change on the next query. The food question, for example, stopped appearing as a gap once its section was added.

That's the flywheel: parents get a trustworthy answer, operators see the gaps the next morning, a one-click fix makes tomorrow's parent experience better.

## What's fake and what's honest

- **The daycare is fictional.** Names, prices, the director's bio, and the traditions (Muffin Mornings, Butterfly Release) are invented so the site looks like a real business.
- **The policies are adapted from a real handbook.** Specifically, the [City of Albuquerque Division of Child & Family Development Family Handbook](https://www.cabq.gov/family/documents/2019-division-of-child-and-family-development-family-handbook-final.pdf), which the take-home brief recommended as a reference. The illness rules (24-hour fever-free, 100.4°F threshold), immunization exemptions, and meal-program details trace back to the source.
- **The chat answers are real AI answers, grounded in that handbook.** Not scripted, not hard-coded. If you ask something it doesn't know, it will tell you so.

## Rough edges to ignore

- **No login on `/admin`.** Anyone with the URL can edit the handbook. Intentional for a private-link demo; a real product would put an auth gate here.
- **If the same fact is repeated in two handbook sections, an edit can leave one stale.** Known limitation documented in the project README.
- **First question in a fresh session can take a few seconds** while the server warms up. Subsequent questions stream in under a second.

## Questions

Reach out to Jon (jon.a.cook7@gmail.com). Code and a list of "what I'd build next" are in the [GitHub repo](https://github.com/cooksterj/brightwheel-frontdesk); the architecture diagrams are at [`docs/ARCHITECTURE.md`](https://github.com/cooksterj/brightwheel-frontdesk/blob/main/docs/ARCHITECTURE.md).
