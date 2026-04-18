import { describe, expect, it } from "vitest";
import { readTextStream } from "./stream-reader";

function responseFromChunks(chunks: Uint8Array[]): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const c of chunks) controller.enqueue(c);
      controller.close();
    },
  });
  return new Response(stream);
}

describe("readTextStream", () => {
  it("yields decoded text chunks in order", async () => {
    const enc = new TextEncoder();
    const res = responseFromChunks([enc.encode("hello "), enc.encode("world")]);
    const parts: string[] = [];
    for await (const chunk of readTextStream(res)) parts.push(chunk);
    expect(parts.join("")).toBe("hello world");
  });

  it("buffers partial multi-byte UTF-8 sequences across chunks", async () => {
    // "£" is 0xC2 0xA3. Split between chunks to verify buffering.
    const res = responseFromChunks([
      new Uint8Array([0xc2]),
      new Uint8Array([0xa3, 0x21]),
    ]);
    const parts: string[] = [];
    for await (const chunk of readTextStream(res)) parts.push(chunk);
    expect(parts.join("")).toBe("£!");
  });

  it("throws when the response has no body", async () => {
    const res = new Response(null);
    await expect(async () => {
      for await (const _ of readTextStream(res)) void _;
    }).rejects.toThrow(/no body/);
  });
});
