import { describe, expect, it, vi } from "vitest";
import { listQuestions, summarize, type QuestionRow } from "./repo";

function mockClient(result: { data: unknown; error: unknown }) {
  const limit = vi.fn(async () => result);
  const order = vi.fn(() => ({ limit }));
  const eq = vi.fn(function chain(): unknown {
    return { eq, order };
  });
  const select = vi.fn(() => ({ eq, order }));
  const from = vi.fn(() => ({ select }));
  return { client: { from } as never, spies: { from, select, eq, order, limit } };
}

describe("listQuestions", () => {
  it("selects questions ordered by created_at desc with default limit 200", async () => {
    const { client, spies } = mockClient({ data: [], error: null });
    await listQuestions(client);
    expect(spies.from).toHaveBeenCalledWith("questions");
    expect(spies.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(spies.limit).toHaveBeenCalledWith(200);
  });

  it("applies confidence and intent filters when provided", async () => {
    const { client, spies } = mockClient({ data: [], error: null });
    await listQuestions(client, { confidence: "low", intent: "illness", limit: 50 });
    expect(spies.eq).toHaveBeenCalledWith("confidence", "low");
    expect(spies.eq).toHaveBeenCalledWith("intent", "illness");
    expect(spies.limit).toHaveBeenCalledWith(50);
  });

  it("throws on supabase error", async () => {
    const { client } = mockClient({ data: null, error: { message: "boom" } });
    await expect(listQuestions(client)).rejects.toThrow(/boom/);
  });

  it("returns empty array when data is null but no error", async () => {
    const { client } = mockClient({ data: null, error: null });
    expect(await listQuestions(client)).toEqual([]);
  });
});

describe("summarize", () => {
  const row = (extra: Partial<QuestionRow>): QuestionRow => ({
    id: "id",
    query: "q",
    retrieved_slugs: [],
    top_similarity: null,
    confidence: null,
    intent: null,
    session_id: null,
    resolved_at: null,
    created_at: "2026-04-19T00:00:00Z",
    ...extra,
  });

  it("counts by confidence and intent, plus resolved", () => {
    const rows: QuestionRow[] = [
      row({ confidence: "high" }),
      row({ confidence: "high" }),
      row({ confidence: "medium" }),
      row({ confidence: "low", intent: "emergency" }),
      row({ confidence: "low", resolved_at: "2026-04-19T01:00:00Z" }),
    ];
    expect(summarize(rows)).toEqual({
      total: 5,
      high: 2,
      medium: 1,
      low: 2,
      emergency: 1,
      resolved: 1,
    });
  });

  it("handles an empty list", () => {
    expect(summarize([])).toEqual({
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      emergency: 0,
      resolved: 0,
    });
  });
});
