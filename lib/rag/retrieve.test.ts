import { describe, expect, it, vi } from "vitest";
import { retrieveSections } from "./retrieve";

describe("retrieveSections", () => {
  it("calls the match_handbook_sections RPC with the query embedding", async () => {
    const rpc = vi.fn(async () => ({
      data: [
        {
          slug: "illness-policy",
          title: "Illness Policy",
          body: "Fever-free 24 hours…",
          similarity: 0.87,
        },
      ],
      error: null,
    }));
    const result = await retrieveSections({ rpc } as never, [0.1, 0.2, 0.3], 3);
    expect(rpc).toHaveBeenCalledWith("match_handbook_sections", {
      query_embedding: [0.1, 0.2, 0.3],
      match_count: 3,
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("illness-policy");
  });

  it("defaults matchCount to 5", async () => {
    const rpc = vi.fn(async () => ({ data: [], error: null }));
    await retrieveSections({ rpc } as never, [0.1]);
    const args = (rpc.mock.calls[0] as unknown as [string, { match_count: number }])[1];
    expect(args.match_count).toBe(5);
  });

  it("throws when the RPC returns an error", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "function does not exist" },
    }));
    await expect(
      retrieveSections({ rpc } as never, [0.1]),
    ).rejects.toThrow(/function does not exist/);
  });

  it("returns an empty array when data is null but no error", async () => {
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    expect(await retrieveSections({ rpc } as never, [0.1])).toEqual([]);
  });
});
