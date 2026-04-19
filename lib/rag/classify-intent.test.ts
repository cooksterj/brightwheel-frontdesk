import { describe, expect, it, vi } from "vitest";
import { classifyIntent } from "./classify-intent";

function mockClient(text: string) {
  return {
    messages: {
      create: vi.fn(async () => ({
        content: [{ type: "text", text }],
        role: "assistant",
        stop_reason: "end_turn",
        usage: { input_tokens: 1, output_tokens: 1 },
      })),
    },
  };
}

describe("classifyIntent", () => {
  it("returns the parsed intent for a well-formed JSON reply", async () => {
    const client = mockClient(
      '{"intent":"emergency","rationale":"child unresponsive"}',
    );
    const result = await classifyIntent({
      client: client as never,
      text: "my son won't wake up",
    });
    expect(result.intent).toBe("emergency");
    expect(result.rationale).toContain("unresponsive");
  });

  it("tolerates prose around the JSON", async () => {
    const client = mockClient(
      'Sure — here\'s my classification:\n\n{"intent":"tour","rationale":"parent is considering enrolling"}\n\nLet me know.',
    );
    const result = await classifyIntent({
      client: client as never,
      text: "we'd love to visit next week",
    });
    expect(result.intent).toBe("tour");
  });

  it("falls back to general when the intent is unknown", async () => {
    const client = mockClient('{"intent":"bogus","rationale":"…"}');
    const result = await classifyIntent({
      client: client as never,
      text: "what is the meaning of life",
    });
    expect(result.intent).toBe("general");
    expect(result.rationale).toMatch(/default/);
  });

  it("falls back to general when the response has no JSON", async () => {
    const client = mockClient("I'm not sure, could you clarify?");
    const result = await classifyIntent({
      client: client as never,
      text: "hi",
    });
    expect(result.intent).toBe("general");
  });

  it("falls back to general when the client throws", async () => {
    const client = {
      messages: {
        create: vi.fn(async () => {
          throw new Error("network");
        }),
      },
    };
    const result = await classifyIntent({
      client: client as never,
      text: "hi",
    });
    expect(result.intent).toBe("general");
    expect(result.rationale).toMatch(/default/);
  });
});
