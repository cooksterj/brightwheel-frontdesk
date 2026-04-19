import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./answer";
import type { RetrievedSection } from "./retrieve";

const section: RetrievedSection = {
  slug: "illness-policy",
  title: "Illness Policy",
  body: "A sick child stays home. Fever-free 24 hours before returning.",
  similarity: 0.88,
};

describe("buildSystemPrompt", () => {
  it("includes the retrieved sections inline", () => {
    const prompt = buildSystemPrompt([section]);
    expect(prompt).toContain("### § Illness Policy");
    expect(prompt).toContain("A sick child stays home");
  });

  it("instructs Claude to cite with the `[§ Section Title]` pattern", () => {
    const prompt = buildSystemPrompt([section]);
    expect(prompt).toContain("[§ Section Title]");
  });

  it("instructs Claude to route emergencies to 911 before quoting handbook", () => {
    const prompt = buildSystemPrompt([section]);
    expect(prompt).toMatch(/911|emergency/i);
  });

  it("handles the empty-retrieval case gracefully", () => {
    const prompt = buildSystemPrompt([]);
    expect(prompt).toMatch(/No handbook sections were retrieved/i);
  });

  it("appends illness guidance when intent=illness", () => {
    const prompt = buildSystemPrompt([section], "illness");
    expect(prompt).toMatch(/symptom log/i);
  });

  it("appends tour CTA when intent=tour", () => {
    const prompt = buildSystemPrompt([section], "tour");
    expect(prompt).toMatch(/pass it to Maria/i);
  });

  it("adds no tailoring for general intent", () => {
    const baseline = buildSystemPrompt([section]);
    const general = buildSystemPrompt([section], "general");
    expect(general).toBe(baseline);
  });
});
