import { describe, expect, it, vi } from "vitest";
import { reembedSection } from "./reembed";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("reembedSection", () => {
  it("embeds title + body as a single document with voyage-4-lite", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        data: [{ embedding: [0.1, 0.2, 0.3], index: 0 }],
        model: "voyage-4-lite",
        usage: { total_tokens: 5 },
      }),
    );
    const vec = await reembedSection("Illness Policy", "A sick child stays home.", {
      apiKey: "pa-test",
      fetchImpl,
    });
    expect(vec).toEqual([0.1, 0.2, 0.3]);

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.input).toEqual(["Illness Policy\n\nA sick child stays home."]);
    expect(body.model).toBe("voyage-4-lite");
    expect(body.input_type).toBe("document");
  });
});
