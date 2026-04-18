import type { SupabaseClient } from "@supabase/supabase-js";

export interface RetrievedSection {
  slug: string;
  title: string;
  body: string;
  similarity: number;
}

/**
 * Calls the `match_handbook_sections` Postgres function to fetch the top-k
 * most semantically-similar handbook sections for a query embedding.
 */
export async function retrieveSections(
  client: Pick<SupabaseClient, "rpc">,
  queryEmbedding: number[],
  matchCount = 5,
): Promise<RetrievedSection[]> {
  const { data, error } = await client.rpc("match_handbook_sections", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });
  if (error) {
    throw new Error(`retrieveSections: ${error.message}`);
  }
  return (data ?? []) as RetrievedSection[];
}
