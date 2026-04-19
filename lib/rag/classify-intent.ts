import type Anthropic from "@anthropic-ai/sdk";
import { extractJsonObject } from "./json";

export type Intent = "emergency" | "illness" | "tour" | "general";

export const INTENTS: readonly Intent[] = [
  "emergency",
  "illness",
  "tour",
  "general",
];

export interface ClassifiedIntent {
  intent: Intent;
  rationale: string;
}

export const DEFAULT_MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = [
  "Classify the parent's chat message into ONE intent. Respond with a JSON object and NOTHING else:",
  "",
  '{ "intent": "emergency" | "illness" | "tour" | "general", "rationale": "one short sentence" }',
  "",
  "Definitions:",
  "- emergency: the child is in IMMEDIATE medical danger right now — choking, seizure, anaphylaxis, poisoning, head injury, trouble breathing, unresponsive, severe bleeding. Do NOT pick this for routine fevers, stomach bugs, or general sickness questions.",
  "- illness: the parent is asking about their child's sickness symptoms, when a sick child can return, or sick-day policy. Fever, vomiting, diarrhea, pink eye, rash, cough, etc.",
  "- tour: the parent is considering enrolling, wants to visit the center, or is asking how to become a family.",
  "- general: every other question — tuition, schedules, meals, hours, pickup, curriculum, etc.",
  "",
  "When in doubt between emergency and illness, prefer illness unless the message clearly describes a life-threatening situation happening right now.",
  "",
  "Respond with the JSON object only. No prose before or after.",
].join("\n");

const FALLBACK: ClassifiedIntent = {
  intent: "general",
  rationale: "classifier unavailable — defaulting to general",
};

export async function classifyIntent(opts: {
  client: Anthropic;
  text: string;
  model?: string;
  fetchImpl?: typeof fetch;
}): Promise<ClassifiedIntent> {
  try {
    const resp = await opts.client.messages.create({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: opts.text }],
    });
    const text = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const parsed = extractJsonObject(text);
    if (!parsed) return FALLBACK;

    const intent = String(parsed.intent ?? "").trim().toLowerCase();
    if (!INTENTS.includes(intent as Intent)) return FALLBACK;

    return {
      intent: intent as Intent,
      rationale: String(parsed.rationale ?? "").trim().slice(0, 500),
    };
  } catch (err) {
    console.error("classifyIntent failed:", err);
    return FALLBACK;
  }
}
