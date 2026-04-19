import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/rag/chunk";

export interface CreateArgs {
  title: string;
  body: string;
  embedding: number[];
  editor?: string;
}

export interface CreatedSection {
  id: string;
  slug: string;
  title: string;
  body: string;
  version: number;
}

type Client = Pick<SupabaseClient, "from">;

export async function createSection(
  client: Client,
  args: CreateArgs,
): Promise<CreatedSection> {
  const base = slugify(args.title);
  if (!base) {
    throw new Error("createSection: title produces an empty slug");
  }
  const slug = await findUniqueSlug(client, base);

  const { data, error } = await client
    .from("handbook_sections")
    .insert({
      slug,
      title: args.title,
      body: args.body,
      embedding: args.embedding,
      updated_by: args.editor ?? "admin",
    })
    .select("id, slug, title, body, version")
    .single();

  if (error) {
    throw new Error(`createSection: ${error.message}`);
  }
  return data as CreatedSection;
}

async function findUniqueSlug(client: Client, base: string): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`;
    const { data, error } = await client
      .from("handbook_sections")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) {
      throw new Error(`findUniqueSlug: ${error.message}`);
    }
    if (!data) return candidate;
  }
  throw new Error(
    `findUniqueSlug: gave up after 50 attempts for base "${base}"`,
  );
}
