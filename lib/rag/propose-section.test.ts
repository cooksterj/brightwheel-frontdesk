import { describe, expect, it } from "vitest";
import { extractJson } from "./propose-section";

describe("extractJson", () => {
  it("parses a bare JSON object", () => {
    expect(
      extractJson('{"topic":"summer","proposedTitle":"Summer","proposedBody":"…"}'),
    ).toEqual({
      topic: "summer",
      proposedTitle: "Summer",
      proposedBody: "…",
    });
  });

  it("tolerates prose surrounding the JSON block", () => {
    const text = `Here's the section you asked for:

{"topic":"summer camp","proposedTitle":"Summer Programs","proposedBody":"Our summer program…"}

Hope this helps.`;
    expect(extractJson(text)).toEqual({
      topic: "summer camp",
      proposedTitle: "Summer Programs",
      proposedBody: "Our summer program…",
    });
  });

  it("returns null when no JSON object is present", () => {
    expect(extractJson("I don't know how to answer that.")).toBeNull();
  });

  it("returns null for JSON arrays (wrong shape)", () => {
    expect(extractJson("[1,2,3]")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(extractJson('{"topic": "summer", "title":}')).toBeNull();
  });
});
