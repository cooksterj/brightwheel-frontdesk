/**
 * Seed script: parse content/handbook/slow-cooker.md into H2 chunks, embed
 * each with Voyage, and upsert into Supabase `handbook_sections`.
 *
 * Idempotent — re-running updates existing rows (keyed by slug).
 *
 * Run with: `just seed`   (or `bun run scripts/seed-handbook.ts`)
 *
 * Prereqs:
 *   1. Supabase migration applied (supabase/migrations/0001_handbook.sql)
 *   2. .env.local populated with VOYAGE_API_KEY, SUPABASE_*
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parsePublicEnv, parseServerEnv } from "../lib/env";
import { chunkHandbook } from "../lib/rag/chunk";
import { embed } from "../lib/voyage/embed";

async function main() {
  const src = process.env as Record<string, string | undefined>;
  const server = parseServerEnv(src);
  const pub = parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: src.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: src.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  const mdPath = resolve(process.cwd(), "content/handbook/slow-cooker.md");
  const md = readFileSync(mdPath, "utf-8");
  const sections = chunkHandbook(md);
  console.log(`parsed ${sections.length} sections from ${mdPath}`);

  console.log("embedding sections via Voyage voyage-4-lite…");
  const inputs = sections.map((s) => `${s.title}\n\n${s.body}`);
  const vectors = await embed(inputs, {
    apiKey: server.VOYAGE_API_KEY,
    model: "voyage-4-lite",
    inputType: "document",
  });
  if (vectors.length !== sections.length) {
    throw new Error(
      `expected ${sections.length} vectors, got ${vectors.length}`,
    );
  }
  console.log(`got ${vectors.length} × ${vectors[0].length}-dim vectors`);

  const supabase = createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );

  console.log(`upserting ${sections.length} rows into handbook_sections…`);
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const { error } = await supabase.from("handbook_sections").upsert(
      {
        slug: s.slug,
        title: s.title,
        body: s.body,
        embedding: vectors[i],
        updated_by: "seed",
      },
      { onConflict: "slug" },
    );
    if (error) {
      console.error(`✗ ${s.slug} — ${error.message}`);
      process.exit(1);
    }
    console.log(`  ✓ ${s.slug}`);
  }
  console.log(`\n✓ seeded ${sections.length} sections`);
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
