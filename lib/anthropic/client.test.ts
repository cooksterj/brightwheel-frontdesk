import { describe, expect, it } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { createAnthropicClient } from "./client";

describe("createAnthropicClient", () => {
  it("returns an Anthropic instance when apiKey is provided", () => {
    const client = createAnthropicClient({ apiKey: "sk-ant-test" });
    expect(client).toBeInstanceOf(Anthropic);
  });

  it("throws when apiKey is empty", () => {
    expect(() => createAnthropicClient({ apiKey: "" })).toThrow(/apiKey/);
  });
});
