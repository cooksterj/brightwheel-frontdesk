import type { SupabaseClient } from "@supabase/supabase-js";

export interface QuestionRow {
  id: string;
  query: string;
  retrieved_slugs: string[];
  top_similarity: number | null;
  confidence: "high" | "medium" | "low" | null;
  intent: "emergency" | "illness" | "tour" | "general" | null;
  session_id: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface ListOptions {
  limit?: number;
  confidence?: "high" | "medium" | "low";
  intent?: "emergency" | "illness" | "tour" | "general";
}

type Client = Pick<SupabaseClient, "from">;

const COLUMNS =
  "id, query, retrieved_slugs, top_similarity, confidence, intent, session_id, resolved_at, created_at";

export async function listQuestions(
  client: Client,
  opts: ListOptions = {},
): Promise<QuestionRow[]> {
  let query = client.from("questions").select(COLUMNS);
  if (opts.confidence) query = query.eq("confidence", opts.confidence);
  if (opts.intent) query = query.eq("intent", opts.intent);
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);
  if (error) throw new Error(`listQuestions: ${error.message}`);
  return (data ?? []) as QuestionRow[];
}

export interface Stats {
  total: number;
  high: number;
  medium: number;
  low: number;
  emergency: number;
  resolved: number;
}

/** Summary counts for the /admin/questions header. Single query, one pass. */
export function summarize(rows: QuestionRow[]): Stats {
  const s: Stats = {
    total: rows.length,
    high: 0,
    medium: 0,
    low: 0,
    emergency: 0,
    resolved: 0,
  };
  for (const r of rows) {
    if (r.confidence === "high") s.high++;
    else if (r.confidence === "medium") s.medium++;
    else if (r.confidence === "low") s.low++;
    if (r.intent === "emergency") s.emergency++;
    if (r.resolved_at) s.resolved++;
  }
  return s;
}
