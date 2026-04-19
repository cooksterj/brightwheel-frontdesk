import type Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@/lib/chat/types";
import type { Intent } from "./classify-intent";
import type { RetrievedSection } from "./retrieve";

export const DEFAULT_MODEL = "claude-sonnet-4-6";
export const DEFAULT_MAX_TOKENS = 700;

const INTENT_GUIDANCE: Record<Intent, string> = {
  emergency: "",
  illness:
    "\nThis message is about a sick child. After citing the relevant handbook section, add a brief close: \"If this is happening at school, please also let your child's teacher know directly so they can start a symptom log and keep other families informed if it's contagious.\"",
  tour:
    "\nThis message is about visiting or enrolling. Quote the tour availability from the handbook, then close with: \"If you'd like, reply with your child's age and a preferred day/time and I'll pass it to Maria.\"",
  general: "",
};

/**
 * Compose the system prompt: product voice + retrieval context + citation
 * rules. The handbook sections are included verbatim; Claude is instructed
 * to ground answers only in this context and to append a `[§ Section Title]`
 * marker after factual claims.
 *
 * An optional `intent` appends a closing instruction that tailors the answer
 * (e.g. an illness reminder to also notify the teacher, or a tour CTA).
 */
export function buildSystemPrompt(
  sections: RetrievedSection[],
  intent: Intent = "general",
): string {
  const context = sections
    .map((s) => `### § ${s.title}\n\n${s.body}`)
    .join("\n\n---\n\n");

  return [
    "You are the front-desk assistant for **The Slow Cooker**, a small family early-learning center in Albuquerque, New Mexico.",
    "",
    "Tone: warm, concrete, a little unhurried. Short paragraphs. Do not perform.",
    "",
    "Answer rules:",
    "- Answer parents' questions using ONLY the handbook sections below. If the answer is not in those sections, say so briefly and suggest they email the director at hello@slowcooker.example.",
    "- End every factual claim with a citation marker like `[§ Section Title]`, using the exact section title from the context. If a single answer draws on two sections, cite both.",
    "- Keep answers to 2–4 short sentences unless the question genuinely needs more.",
    "- For medical emergencies or suspected abuse, stop and tell the parent to call 911 or their pediatrician. Do not quote the handbook first.",
    "- Never invent policies, prices, times, or names that aren't in the context.",
    "",
    sections.length === 0
      ? "No handbook sections were retrieved for this question."
      : "Relevant handbook sections:\n\n" + context,
    INTENT_GUIDANCE[intent],
  ]
    .filter(Boolean)
    .join("\n");
}

export interface StreamAnswerOptions {
  client: Anthropic;
  messages: Message[];
  sections: RetrievedSection[];
  intent?: Intent;
  model?: string;
  maxTokens?: number;
}

/**
 * Stream Claude's answer token-by-token as plain text. The handbook context
 * is placed in a cached system block (prompt caching cuts cost of repeat
 * queries within a 5-minute window).
 */
export async function* streamAnswer(
  opts: StreamAnswerOptions,
): AsyncGenerator<string> {
  const { client, messages, sections } = opts;
  const system = buildSystemPrompt(sections, opts.intent ?? "general");

  const convo = messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));

  const stream = client.messages.stream({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: convo,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
