import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { Message } from "@/lib/chat/types";
import { getServerEnv } from "@/lib/env";
import { streamAnswer } from "@/lib/rag/answer";
import { classifyIntent, type Intent } from "@/lib/rag/classify-intent";
import { logQuestion } from "@/lib/rag/log";
import { retrieveSections } from "@/lib/rag/retrieve";
import { validateMessageLimits } from "@/lib/security/limits";
import { isAllowedOrigin } from "@/lib/security/origin";
import { createAdminSupabase } from "@/lib/supabase/admin";
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

const EMERGENCY_MESSAGE = [
  "**If this is a medical emergency, please call 911 right now.**",
  "",
  "For urgent questions about your child while they're at the center, call us at **(505) 555-0142** — someone will pick up during open hours. Outside of hours, your pediatrician or nearest urgent care is the right place to start.",
  "",
  "I'm going to stay out of the way on this one. Your child's safety is always more important than a chat answer.",
].join("\n");

function emergencyStream(): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode(EMERGENCY_MESSAGE));
      controller.close();
    },
  });
}

function streamResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
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
  const anthropic = new Anthropic({ apiKey: server.ANTHROPIC_API_KEY });
  const supabase = createAdminSupabase();

  // 3. Intent classifier — Haiku gate before RAG. Routes emergencies to a
  //    canned "call 911" message (no LLM), tailors illness / tour answers.
  const classified = await classifyIntent({
    client: anthropic,
    text: lastUser.content,
  });
  const intent: Intent = classified.intent;

  if (intent === "emergency") {
    // Fire-and-forget log — skip embedding (not useful for emergencies and
    // a waste of Voyage tokens). Log happens in the background; the user
    // gets the canned response immediately.
    void logQuestion(supabase, {
      query: lastUser.content,
      queryEmbedding: null,
      answer: EMERGENCY_MESSAGE,
      sections: [],
      intent,
    });
    return streamResponse(emergencyStream());
  }

  const [queryVector] = await embed(lastUser.content, {
    apiKey: server.VOYAGE_API_KEY,
    model: "voyage-4-lite",
    inputType: "query",
  });

  const sections = await retrieveSections(supabase, queryVector, 5);

  const messages: Message[] = body.messages.map((m, i) => ({
    id: String(i),
    role: m.role,
    content: m.content,
  }));

  const encoder = new TextEncoder();
  let fullAnswer = "";
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamAnswer({
          client: anthropic,
          messages,
          sections,
          intent,
        })) {
          fullAnswer += chunk;
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
        await logQuestion(supabase, {
          query: lastUser.content,
          queryEmbedding: queryVector,
          answer: fullAnswer,
          sections,
          intent,
        });
      }
    },
  });

  return streamResponse(stream);
}
