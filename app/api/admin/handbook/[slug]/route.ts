import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import { reembedSection } from "@/lib/handbook/reembed";
import { getSection, updateSection } from "@/lib/handbook/repo";
import { isAllowedOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TITLE = 200;
const MAX_BODY = 20_000;

interface PatchBody {
  title?: string;
  body?: string;
}

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function supabaseServer() {
  const server = getServerEnv();
  const pub = getPublicEnv();
  return createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const supabase = supabaseServer();
  const row = await getSection(supabase, slug);
  if (!row) return jsonError("section not found", 404);
  return json(row);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const origin = req.headers.get("origin");
  if (
    !isAllowedOrigin(origin, {
      allowAll: process.env.NODE_ENV === "development",
    })
  ) {
    return jsonError("forbidden", 403);
  }

  const { slug } = await ctx.params;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return jsonError("invalid JSON body");
  }

  const nextTitle = typeof body.title === "string" ? body.title.trim() : null;
  const nextBody = typeof body.body === "string" ? body.body : null;
  if (!nextTitle || !nextBody) {
    return jsonError("title and body are both required");
  }
  if (nextTitle.length > MAX_TITLE) {
    return jsonError(`title too long (max ${MAX_TITLE} chars)`, 413);
  }
  if (nextBody.length > MAX_BODY) {
    return jsonError(`body too long (max ${MAX_BODY} chars)`, 413);
  }

  const supabase = supabaseServer();
  const current = await getSection(supabase, slug);
  if (!current) return jsonError("section not found", 404);

  const server = getServerEnv();
  const embedding = await reembedSection(nextTitle, nextBody, {
    apiKey: server.VOYAGE_API_KEY,
  });

  const updated = await updateSection(supabase, slug, {
    title: nextTitle,
    body: nextBody,
    embedding,
    editor: "admin",
  });

  return json(updated);
}
