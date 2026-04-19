import type { SupabaseClient } from "@supabase/supabase-js";

export interface SectionRow {
  id: string;
  slug: string;
  title: string;
  body: string;
  version: number;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
}

type Client = Pick<SupabaseClient, "from">;

const LIVE_COLUMNS =
  "id, slug, title, body, version, updated_at, updated_by, deleted_at";

export async function listSections(client: Client): Promise<SectionRow[]> {
  const { data, error } = await client
    .from("handbook_sections")
    .select(LIVE_COLUMNS)
    .is("deleted_at", null)
    .order("title", { ascending: true });
  if (error) throw new Error(`listSections: ${error.message}`);
  return (data ?? []) as SectionRow[];
}

export async function getSection(
  client: Client,
  slug: string,
): Promise<SectionRow | null> {
  const { data, error } = await client
    .from("handbook_sections")
    .select(LIVE_COLUMNS)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(`getSection: ${error.message}`);
  return (data ?? null) as SectionRow | null;
}

export interface UpdateArgs {
  title: string;
  body: string;
  embedding: number[];
  editor?: string;
}

/**
 * Two-step update:
 *   1. snapshot the current row into handbook_section_versions
 *   2. update the live row (title, body, embedding, version++, updated_at)
 *
 * Not wrapped in a transaction — worst case is an orphan snapshot row if
 * step 2 fails, which is harmless. Real concurrency protection would move
 * this into a Postgres function; fine to defer for a prototype.
 */
export async function updateSection(
  client: Client,
  slug: string,
  args: UpdateArgs,
): Promise<SectionRow> {
  const current = await getSection(client, slug);
  if (!current) {
    throw new Error(`updateSection: no section with slug "${slug}"`);
  }

  const { error: snapError } = await client
    .from("handbook_section_versions")
    .insert({
      section_id: current.id,
      title: current.title,
      body: current.body,
      version: current.version,
      archived_by: args.editor ?? "admin",
    });
  if (snapError) {
    throw new Error(`updateSection (snapshot): ${snapError.message}`);
  }

  const { data, error: updateError } = await client
    .from("handbook_sections")
    .update({
      title: args.title,
      body: args.body,
      embedding: args.embedding,
      version: current.version + 1,
      updated_by: args.editor ?? "admin",
    })
    .eq("id", current.id)
    .select(LIVE_COLUMNS)
    .single();
  if (updateError) {
    throw new Error(`updateSection (update): ${updateError.message}`);
  }
  return data as SectionRow;
}
