import { describe, expect, it, vi } from "vitest";
import { embed } from "./embed";

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

function firstCall(fn: ReturnType<typeof vi.fn>): [string, RequestInit] {
  const calls = fn.mock.calls as unknown as Array<[string, RequestInit]>;
  expect(calls.length).toBeGreaterThan(0);
  return calls[0];
}

describe("embed", () => {
  it("calls Voyage with the right URL, auth, and payload defaults", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        data: [{ embedding: [0.1, 0.2], index: 0 }],
        model: "voyage-4-lite",
        usage: { total_tokens: 3 },
      }),
    );
    await embed("hello", { apiKey: "pa-test", fetchImpl });

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = firstCall(fetchImpl);
    expect(url).toBe("https://api.voyageai.com/v1/embeddings");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer pa-test",
    );
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      input: "hello",
      model: "voyage-4-lite",
      input_type: "document",
    });
  });

  it("returns vectors in the same order as the input indices, even if API returns them out of order", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        data: [
          { embedding: [0.3], index: 2 },
          { embedding: [0.1], index: 0 },
          { embedding: [0.2], index: 1 },
        ],
        model: "voyage-4-lite",
        usage: { total_tokens: 10 },
      }),
    );
    const vectors = await embed(["a", "b", "c"], {
      apiKey: "pa-test",
      fetchImpl,
    });
    expect(vectors).toEqual([[0.1], [0.2], [0.3]]);
  });

  it("respects model and inputType overrides", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        data: [{ embedding: [0.1], index: 0 }],
        model: "voyage-4",
        usage: { total_tokens: 1 },
      }),
    );
    await embed("q", {
      apiKey: "pa-test",
      model: "voyage-4",
      inputType: "query",
      fetchImpl,
    });
    const [, init] = firstCall(fetchImpl);
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("voyage-4");
    expect(body.input_type).toBe("query");
  });

  it("throws with the status code when Voyage responds with an error", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      new Response("bad key", { status: 401, statusText: "Unauthorized" }),
    );
    await expect(embed("x", { apiKey: "pa-bad", fetchImpl })).rejects.toThrow(
      /401/,
    );
  });

  it("throws when apiKey is missing", async () => {
    await expect(embed("x", { apiKey: "" })).rejects.toThrow(/apiKey/);
  });
});
