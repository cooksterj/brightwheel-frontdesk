import { describe, expect, it } from "vitest";
import {
  clusterBySimilarity,
  cosineSimilarity,
  parseVector,
} from "./cluster";

describe("cosineSimilarity", () => {
  it("returns 1 for identical unit vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
  });
  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });
  it("is scale-invariant", () => {
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  });
  it("returns 0 when either vector is zero-length", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
    expect(cosineSimilarity([1, 1], [0, 0])).toBe(0);
  });
  it("throws on dimension mismatch", () => {
    expect(() => cosineSimilarity([1, 0], [1, 0, 0])).toThrow(/dim mismatch/);
  });
});

describe("clusterBySimilarity", () => {
  const items = [
    { id: "a", embedding: [1, 0] },
    { id: "b", embedding: [0.98, 0.05] },
    { id: "c", embedding: [0, 1] },
    { id: "d", embedding: [0.02, 0.99] },
    { id: "e", embedding: [0.7, 0.7] },
  ];

  it("groups highly similar items and isolates outliers", () => {
    const clusters = clusterBySimilarity(items, 0.9);
    const sizes = clusters.map((c) => c.size).sort((x, y) => y - x);
    // Expect: {a,b} {c,d} {e}
    expect(sizes).toEqual([2, 2, 1]);
  });

  it("produces one big cluster when threshold is very low", () => {
    const clusters = clusterBySimilarity(items, 0.0);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].size).toBe(5);
  });

  it("produces N singletons when threshold is impossibly high", () => {
    const clusters = clusterBySimilarity(items, 0.9999);
    expect(clusters).toHaveLength(5);
    for (const c of clusters) expect(c.size).toBe(1);
  });

  it("is transitive — A~B and B~C groups A,B,C even if A!~C", () => {
    // Three points roughly along an arc where neighbors are similar but
    // endpoints aren't.
    const chain = [
      { id: "1", embedding: [1, 0] },
      { id: "2", embedding: [0.7, 0.7] },
      { id: "3", embedding: [0, 1] },
    ];
    const clusters = clusterBySimilarity(chain, 0.65);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].size).toBe(3);
  });
});

describe("parseVector", () => {
  it("returns arrays unchanged", () => {
    expect(parseVector([0.1, 0.2, 0.3])).toEqual([0.1, 0.2, 0.3]);
  });
  it("parses JSON-stringified arrays", () => {
    expect(parseVector("[0.1,0.2,0.3]")).toEqual([0.1, 0.2, 0.3]);
  });
  it("returns null for mixed-type arrays", () => {
    expect(parseVector([0.1, "bad", 0.3])).toBeNull();
  });
  it("returns null for malformed strings", () => {
    expect(parseVector("not json")).toBeNull();
  });
  it("returns null for null/undefined/number", () => {
    expect(parseVector(null)).toBeNull();
    expect(parseVector(undefined)).toBeNull();
    expect(parseVector(42)).toBeNull();
  });
});
