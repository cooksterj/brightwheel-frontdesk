import { describe, expect, it, vi } from "vitest";
import { buildQuestionRow, logQuestion } from "./log";
import type { RetrievedSection } from "./retrieve";

const sections: RetrievedSection[] = [
  { slug: "illness-policy", title: "Illness Policy", body: "…", similarity: 0.63 },
  { slug: "medication", title: "Medication", body: "…", similarity: 0.48 },
];

describe("buildQuestionRow", () => {
  it("captures the query, embedding, retrieval, and confidence", () => {
    const row = buildQuestionRow({
      query: "when can my kid come back?",
      queryEmbedding: [0.1, 0.2, 0.3],
      answer: "24 hours fever-free [§ Illness Policy]",
      sections,
    });
    expect(row.query).toBe("when can my kid come back?");
    expect(row.query_embedding).toEqual([0.1, 0.2, 0.3]);
    expect(row.retrieved_slugs).toEqual(["illness-policy", "medication"]);
    expect(row.top_similarity).toBeCloseTo(0.63);
    expect(row.confidence).toBe("high");
    expect(row.session_id).toBeNull();
  });

  it("records low confidence when no sections retrieved", () => {
    const row = buildQuestionRow({
      query: "do you have summer camp?",
      queryEmbedding: [0.1],
      answer: "I couldn't find that in the handbook.",
      sections: [],
    });
    expect(row.top_similarity).toBeNull();
    expect(row.confidence).toBe("low");
    expect(row.retrieved_slugs).toEqual([]);
  });
});

describe("logQuestion", () => {
  it("inserts the built row via the Supabase client", async () => {
    const insert = vi.fn(async () => ({ error: null }));
    const client = { from: vi.fn(() => ({ insert })) };
    await logQuestion(client as never, {
      query: "hi",
      queryEmbedding: [0.1],
      answer: "hello",
      sections: [],
    });
    expect(client.from).toHaveBeenCalledWith("questions");
    expect(insert).toHaveBeenCalledOnce();
    const inserted = (insert.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(inserted.query).toBe("hi");
    expect(inserted.confidence).toBe("low");
  });

  it("swallows insert errors — logging is best-effort", async () => {
    const insert = vi.fn(async () => ({ error: { message: "boom" } }));
    const client = { from: vi.fn(() => ({ insert })) };
    await expect(
      logQuestion(client as never, {
        query: "hi",
        queryEmbedding: [0.1],
        answer: "",
        sections: [],
      }),
    ).resolves.toBeUndefined();
  });

  it("swallows thrown errors too", async () => {
    const insert = vi.fn(async () => {
      throw new Error("network");
    });
    const client = { from: vi.fn(() => ({ insert })) };
    await expect(
      logQuestion(client as never, {
        query: "hi",
        queryEmbedding: [0.1],
        answer: "",
        sections: [],
      }),
    ).resolves.toBeUndefined();
  });
});
