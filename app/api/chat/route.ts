import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { Message } from "@/lib/chat/types";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import { streamAnswer } from "@/lib/rag/answer";
import { retrieveSections } from "@/lib/rag/retrieve";
import { validateMessageLimits } from "@/lib/security/limits";
import { isAllowedOrigin } from "@/lib/security/origin";
import { embed } from "@/lib/voyage/embed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  // 1. Origin allowlist — blocks drive-by cross-site POSTs and naïve curl abuse.
  const origin = req.headers.get("origin");
  if (
    !isAllowedOrigin(origin, {
      allowAll: process.env.NODE_ENV === "development",
    })
  ) {
    return jsonError("forbidden", 403);
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError("invalid JSON body");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError("messages is required");
  }

  // 2. Size caps — kills the "stuff a giant prompt" attack before we pay
  //    Voyage or Anthropic for it.
  const violation = validateMessageLimits(body.messages);
  if (violation) {
    return jsonError(violation.reason, 413);
  }

  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  if (!lastUser || !lastUser.content.trim()) {
    return jsonError("no user message to answer");
  }

  const server = getServerEnv();
  const pub = getPublicEnv();

  const [queryVector] = await embed(lastUser.content, {
    apiKey: server.VOYAGE_API_KEY,
    model: "voyage-4-lite",
    inputType: "query",
  });

  const supabase = createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );
  const sections = await retrieveSections(supabase, queryVector, 5);

  const anthropic = new Anthropic({ apiKey: server.ANTHROPIC_API_KEY });
  const messages: Message[] = body.messages.map((m, i) => ({
    id: String(i),
    role: m.role,
    content: m.content,
  }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamAnswer({
          client: anthropic,
          messages,
          sections,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("answer stream error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\nSorry — I lost my place. Please try asking again.",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
