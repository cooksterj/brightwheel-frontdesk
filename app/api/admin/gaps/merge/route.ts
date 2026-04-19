import type { NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createSection } from "@/lib/handbook/create-section";
import { reembedSection } from "@/lib/handbook/reembed";
import { isAllowedOrigin } from "@/lib/security/origin";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface MergeBody {
  title?: string;
  body?: string;
  questionIds?: string[];
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (
    !isAllowedOrigin(origin, {
      allowAll: process.env.NODE_ENV === "development",
    })
  ) {
    return json({ error: "forbidden" }, 403);
  }

  let body: MergeBody;
  try {
    body = (await req.json()) as MergeBody;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.body === "string" ? body.body : "";
  const questionIds = Array.isArray(body.questionIds) ? body.questionIds : [];
  if (!title || !content) {
    return json({ error: "title and body are both required" }, 400);
  }
  if (title.length > 200) return json({ error: "title too long" }, 413);
  if (content.length > 20_000) return json({ error: "body too long" }, 413);

  const server = getServerEnv();
  const supabase = createAdminSupabase();

  const embedding = await reembedSection(title, content, {
    apiKey: server.VOYAGE_API_KEY,
  });
  const created = await createSection(supabase, {
    title,
    body: content,
    embedding,
    editor: "admin",
  });

  // Mark the cluster's questions as resolved so they stop showing as gaps.
  if (questionIds.length > 0) {
    const { error: updateError } = await supabase
      .from("questions")
      .update({ resolved_at: new Date().toISOString() })
      .in("id", questionIds);
    if (updateError) {
      console.error(
        "merge: failed to mark questions resolved:",
        updateError.message,
      );
    }
  }

  return json({ section: created, resolved: questionIds.length });
}
