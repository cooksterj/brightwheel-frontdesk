import type { SupabaseClient } from "@supabase/supabase-js";
import type { Intent } from "./classify-intent";
import { computeConfidence, type Confidence } from "./confidence";
import type { RetrievedSection } from "./retrieve";

export interface LogQuestionArgs {
  query: string;
  queryEmbedding: number[] | null;
  answer: string;
  sections: RetrievedSection[];
  sessionId?: string | null;
  intent?: Intent | null;
}

export interface LoggedRow {
  query: string;
  query_embedding: number[] | null;
  answer: string;
  retrieved_slugs: string[];
  top_similarity: number | null;
  confidence: Confidence;
  session_id: string | null;
  intent: Intent | null;
}

export function buildQuestionRow(args: LogQuestionArgs): LoggedRow {
  const topSimilarity = args.sections[0]?.similarity ?? null;
  return {
    query: args.query,
    query_embedding: args.queryEmbedding,
    answer: args.answer,
    retrieved_slugs: args.sections.map((s) => s.slug),
    top_similarity: topSimilarity,
    confidence: computeConfidence(topSimilarity),
    session_id: args.sessionId ?? null,
    intent: args.intent ?? null,
  };
}

/**
 * Best-effort insert into `questions`. Swallows errors and logs — we never
 * want a logging failure to surface to the chatting parent.
 */
export async function logQuestion(
  client: Pick<SupabaseClient, "from">,
  args: LogQuestionArgs,
): Promise<void> {
  const row = buildQuestionRow(args);
  try {
    const { error } = await client.from("questions").insert(row);
    if (error) {
      console.error("logQuestion insert error:", error.message);
    }
  } catch (err) {
    console.error("logQuestion threw:", err);
  }
}
