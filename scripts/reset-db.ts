/**
 * Destructive: wipes every row from handbook_sections (cascading to
 * handbook_section_versions) and from questions.
 *
 * Table structure, indexes, RPCs, and the pgvector extension are untouched.
 *
 * Normally invoked via `just reset`, which adds a [y/N] prompt and runs
 * the seed scripts after. Running this file directly skips the prompt.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parsePublicEnv, parseServerEnv } from "../lib/env";

type Client = SupabaseClient;

const NEVER_UUID = "00000000-0000-0000-0000-000000000000";

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

  const before = await countAll(supabase);
  console.log("before:", formatCounts(before));

  // Supabase's JS client requires a filter on delete() as a safety guard;
  // neq on a UUID that can't exist matches every real row.
  const q1 = await supabase.from("questions").delete().neq("id", NEVER_UUID);
  if (q1.error) throw new Error(`questions delete: ${q1.error.message}`);

  // handbook_section_versions has ON DELETE CASCADE on section_id, so wiping
  // handbook_sections takes the version history with it. Explicit delete here
  // handles the edge case of orphan version rows.
  const v1 = await supabase
    .from("handbook_section_versions")
    .delete()
    .neq("id", NEVER_UUID);
  if (v1.error) throw new Error(`versions delete: ${v1.error.message}`);

  const h1 = await supabase
    .from("handbook_sections")
    .delete()
    .neq("id", NEVER_UUID);
  if (h1.error) throw new Error(`handbook delete: ${h1.error.message}`);

  const after = await countAll(supabase);
  console.log("after: ", formatCounts(after));
  console.log(
    `\n✓ reset complete — run \`just seed && just seed-questions\` to repopulate`,
  );
}

interface Counts {
  handbook_sections: number;
  handbook_section_versions: number;
  questions: number;
}

async function countAll(
  supabase: Client,
): Promise<Counts> {
  const [h, v, q] = await Promise.all([
    countTable(supabase, "handbook_sections"),
    countTable(supabase, "handbook_section_versions"),
    countTable(supabase, "questions"),
  ]);
  return { handbook_sections: h, handbook_section_versions: v, questions: q };
}

async function countTable(
  supabase: Client,
  table: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`count ${table}: ${error.message}`);
  return count ?? 0;
}

function formatCounts(c: Counts): string {
  return `handbook_sections=${c.handbook_sections}, versions=${c.handbook_section_versions}, questions=${c.questions}`;
}

main().catch((err) => {
  console.error("reset failed:", err);
  process.exit(1);
});
