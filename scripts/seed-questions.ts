/**
 * Seeds the `questions` table with 30 synthetic parent questions so the
 * operator dashboard and knowledge-gap detector have something to show
 * from the first deploy.
 *
 * Shape of the seed set:
 *   - 13 HIGH — directly answerable from the handbook (illness, tuition,
 *     pickup, immunizations, etc.)
 *   - 4 MEDIUM — partial matches (food allergies, teacher languages,
 *     outside food edge cases, refund-on-move)
 *   - 13 LOW — clustered gaps: summer programs (3), school-age aftercare
 *     (3), transportation (3), special diets (3), plus one standalone
 *     (pacifiers at nap). These drive the gap detector.
 *
 * Run with: `just seed-questions`  (or `bun run scripts/seed-questions.ts`)
 */

import { createClient } from "@supabase/supabase-js";
import { parsePublicEnv, parseServerEnv } from "../lib/env";
import { buildQuestionRow } from "../lib/rag/log";
import { retrieveSections } from "../lib/rag/retrieve";
import { embed } from "../lib/voyage/embed";

const QUESTIONS: string[] = [
  // HIGH — clearly resolvable from the handbook
  "What's your sick policy? When can my daughter come back after a fever?",
  "How much is tuition for my 3-year-old?",
  "What time do you open in the morning?",
  "Is there a late pickup fee?",
  "What immunizations do you require?",
  "Can I bring homemade birthday cupcakes?",
  "Who is allowed to pick up my child?",
  "What's your policy when it snows?",
  "Do I need to bring my child's diapers?",
  "Can we tour on the weekend?",
  "What happens during rest time in the afternoon?",
  "Are you open on Juneteenth?",
  "Is there a sibling discount?",

  // MEDIUM — partial / adjacent matches
  "What languages do your teachers speak with the kids?",
  "How do you handle food allergies?",
  "Can I pack a Gatorade in my son's lunch?",
  "What's the refund policy if we move out of state mid-year?",

  // LOW / gaps — cluster 1: summer programs
  "Do you offer a summer camp?",
  "Is there a summer-only schedule option?",
  "What do kids do during the summer break?",

  // LOW / gaps — cluster 2: school-age aftercare
  "Do you take school-aged siblings for after-school care?",
  "My 7-year-old needs somewhere to go after school — can you help?",
  "Do you do elementary-school wraparound care?",

  // LOW / gaps — cluster 3: transportation
  "Do you pick children up from nearby elementary schools?",
  "Is there a bus route or shuttle?",
  "Can you transport my son to his swim lesson?",

  // LOW / gaps — cluster 4: specialty diets
  "Do you accommodate gluten-free meals?",
  "My daughter is on a medically prescribed ketogenic diet — can you work with that?",
  "Do you serve halal meals?",

  // LOW / gap — standalone
  "Do you allow pacifiers at nap time?",
];

async function main() {
  const src = process.env as Record<string, string | undefined>;
  const server = parseServerEnv(src);
  const pub = parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: src.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: src.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  const supabase = createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );

  // Idempotent: clear any prior seed rows before inserting a fresh set.
  const { error: delErr } = await supabase
    .from("questions")
    .delete()
    .eq("session_id", "seed");
  if (delErr) {
    console.error("failed to clear previous seed rows:", delErr.message);
    process.exit(1);
  }

  console.log(`embedding ${QUESTIONS.length} synthetic questions via Voyage…`);
  const vectors = await embed(QUESTIONS, {
    apiKey: server.VOYAGE_API_KEY,
    model: "voyage-4-lite",
    inputType: "query",
  });

  console.log("retrieving sections + computing confidence…");
  const buckets = { high: 0, medium: 0, low: 0 };
  for (let i = 0; i < QUESTIONS.length; i++) {
    const query = QUESTIONS[i];
    const queryEmbedding = vectors[i];
    const sections = await retrieveSections(supabase, queryEmbedding, 5);

    const row = buildQuestionRow({
      query,
      queryEmbedding,
      answer: "(seeded synthetic question — no model answer stored)",
      sections,
      sessionId: "seed",
    });

    const { error } = await supabase.from("questions").insert(row);
    if (error) {
      console.error(`✗ "${query.slice(0, 50)}…": ${error.message}`);
      continue;
    }
    buckets[row.confidence]++;
    const sim = row.top_similarity?.toFixed(2).padStart(4, " ") ?? " n/a";
    console.log(
      `  ${row.confidence.padEnd(6)} | ${sim} | ${query.slice(0, 70)}${query.length > 70 ? "…" : ""}`,
    );
  }
  console.log(
    `\n✓ seeded ${QUESTIONS.length} questions — high=${buckets.high}, medium=${buckets.medium}, low=${buckets.low}`,
  );
}

main().catch((e) => {
  console.error("seed-questions failed:", e);
  process.exit(1);
});
