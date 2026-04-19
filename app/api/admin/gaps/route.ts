import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import { clusterBySimilarity, parseVector } from "@/lib/rag/cluster";
import { proposeSection, type ProposedSection } from "@/lib/rag/propose-section";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface GapQuestion {
  id: string;
  query: string;
  similarity: number | null;
  confidence: string | null;
  created_at: string;
}

export interface GapCluster {
  id: string;
  size: number;
  questions: GapQuestion[];
  proposal: ProposedSection;
}

export async function GET(_req: NextRequest) {
  const server = getServerEnv();
  const pub = getPublicEnv();
  const supabase = createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, query, query_embedding, confidence, top_similarity, created_at",
    )
    .in("confidence", ["medium", "low"])
    .is("resolved_at", null)
    .not("query_embedding", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? [])
    .map((row) => {
      const embedding = parseVector(row.query_embedding);
      if (!embedding) return null;
      return {
        id: row.id as string,
        query: row.query as string,
        similarity: (row.top_similarity as number | null) ?? null,
        confidence: (row.confidence as string | null) ?? null,
        created_at: row.created_at as string,
        embedding,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Threshold is empirical for voyage-4-lite on short parent questions —
  // question-to-question similarities cluster tighter than question-to-handbook.
  // 0.60 catches the loose-vocabulary clusters (summer camp, specialty diets)
  // without merging disjoint topics. Tune here if the dashboard looks wrong.
  const CLUSTER_THRESHOLD = 0.6;
  const all = clusterBySimilarity(items, CLUSTER_THRESHOLD);
  const groups = all
    .filter((c) => c.size >= 2)
    .sort((a, b) => b.size - a.size);

  const singletonCount = all.filter((c) => c.size === 1).length;
  console.log(
    `gaps: ${items.length} candidates → ${groups.length} clusters (${groups
      .map((c) => c.size)
      .join(",")}) + ${singletonCount} singletons at τ=${CLUSTER_THRESHOLD}`,
  );

  if (groups.length === 0) {
    return Response.json({ clusters: [] });
  }

  const anthropic = new Anthropic({ apiKey: server.ANTHROPIC_API_KEY });
  const clusters: GapCluster[] = await Promise.all(
    groups.map(async (c) => {
      const questions = c.members.map((m) => ({
        id: m.id,
        query: m.query,
        similarity: m.similarity,
        confidence: m.confidence,
        created_at: m.created_at,
      }));
      let proposal: ProposedSection;
      try {
        proposal = await proposeSection({
          client: anthropic,
          questions: questions.map((q) => q.query),
        });
      } catch (err) {
        console.error("proposeSection failed:", err);
        proposal = {
          topic: "couldn't draft",
          proposedTitle: "Draft unavailable",
          proposedBody:
            "Claude couldn't draft a section for this cluster right now. Try again or write one by hand.",
        };
      }
      return {
        id: `cluster-${c.id}`,
        size: c.size,
        questions,
        proposal,
      };
    }),
  );

  return Response.json({ clusters });
}
