import { describe, expect, it } from "vitest";
import { computeConfidence } from "./confidence";

describe("computeConfidence", () => {
  it("returns high for strong semantic matches (>= 0.55)", () => {
    expect(computeConfidence(0.92)).toBe("high");
    expect(computeConfidence(0.63)).toBe("high");
    expect(computeConfidence(0.55)).toBe("high");
  });

  it("returns medium for partial matches (0.40 to 0.55)", () => {
    expect(computeConfidence(0.54)).toBe("medium");
    expect(computeConfidence(0.45)).toBe("medium");
    expect(computeConfidence(0.4)).toBe("medium");
  });

  it("returns low for weak or missing matches (< 0.40)", () => {
    expect(computeConfidence(0.39)).toBe("low");
    expect(computeConfidence(0.18)).toBe("low");
    expect(computeConfidence(0)).toBe("low");
    expect(computeConfidence(-0.3)).toBe("low");
  });

  it("treats null, undefined, or NaN as low", () => {
    expect(computeConfidence(null)).toBe("low");
    expect(computeConfidence(undefined)).toBe("low");
    expect(computeConfidence(Number.NaN)).toBe("low");
  });
});
