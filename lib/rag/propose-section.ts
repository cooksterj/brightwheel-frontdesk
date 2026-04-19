import type Anthropic from "@anthropic-ai/sdk";
import { extractJsonObject } from "./json";

export interface ProposedSection {
  topic: string;
  proposedTitle: string;
  proposedBody: string;
}

export interface ProposeOptions {
  client: Anthropic;
  questions: string[];
  model?: string;
  maxTokens?: number;
}

export const DEFAULT_MODEL = "claude-haiku-4-5";
export const DEFAULT_MAX_TOKENS = 700;

const SYSTEM_PROMPT = [
  "You are helping a daycare operator find gaps in their family handbook.",
  "",
  "Below are parent questions our chat couldn't answer confidently. They appear to be about a related topic.",
  "",
  "Draft a **new handbook section** that would answer them. Respond ONLY with a single JSON object matching this schema:",
  "",
  "{",
  "  \"topic\": \"2–5 word topic label, e.g. summer programs\",",
  "  \"proposedTitle\": \"Title Case section heading, e.g. Summer Programs\",",
  "  \"proposedBody\": \"100–250 words, handbook-style prose\"",
  "}",
  "",
  "Rules:",
  "- Write content the operator can accept or quickly edit — include plausible specifics (hours, ages, price bands) rather than vague blanket statements",
  "- Match existing handbook voice: warm, concrete, short paragraphs, no jargon",
  "- Invent reasonable details the operator might actually choose; flag if uncertain",
  "- Respond with NO prose outside the JSON object",
].join("\n");

export async function proposeSection(
  opts: ProposeOptions,
): Promise<ProposedSection> {
  if (opts.questions.length === 0) {
    throw new Error("proposeSection: questions is empty");
  }

  const userMessage = [
    "Parent questions:",
    ...opts.questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "Draft the new section as JSON.",
  ].join("\n");

  const resp = await opts.client.messages.create({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = resp.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  const parsed = extractJsonObject(text);
  if (!parsed) {
    throw new Error("proposeSection: no JSON object in Claude response");
  }
  return {
    topic: String(parsed.topic ?? "").trim().slice(0, 200) || "untitled gap",
    proposedTitle:
      String(parsed.proposedTitle ?? "").trim().slice(0, 200) || "Untitled",
    proposedBody: String(parsed.proposedBody ?? "").trim().slice(0, 5000),
  };
}
