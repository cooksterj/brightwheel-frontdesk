import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chunkHandbook, slugify } from "./chunk";

describe("slugify", () => {
  it("kebab-cases titles", () => {
    expect(slugify("Illness Policy")).toBe("illness-policy");
    expect(slugify("A Note From Our Director")).toBe("a-note-from-our-director");
  });

  it("turns ampersands into 'and'", () => {
    expect(slugify("Meals & Food Allergies")).toBe("meals-and-food-allergies");
    expect(slugify("Weather & Emergency Closures")).toBe(
      "weather-and-emergency-closures",
    );
  });

  it("collapses punctuation and duplicate dashes", () => {
    expect(slugify("Arrival, Departure & Pick-Up")).toBe(
      "arrival-departure-and-pick-up",
    );
  });
});

describe("chunkHandbook", () => {
  it("returns one chunk per H2 section", () => {
    const md = [
      "---",
      "title: x",
      "---",
      "",
      "# ignored top heading",
      "preamble text ignored",
      "",
      "## First",
      "one",
      "",
      "## Second",
      "two",
      "",
    ].join("\n");
    const chunks = chunkHandbook(md);
    expect(chunks.map((c) => c.title)).toEqual(["First", "Second"]);
    expect(chunks[0].body).toBe("one");
    expect(chunks[1].body).toBe("two");
    expect(chunks[0].slug).toBe("first");
  });

  it("drops sections with empty bodies", () => {
    const chunks = chunkHandbook(["## Empty", "", "## Real", "content"].join("\n"));
    expect(chunks.map((c) => c.title)).toEqual(["Real"]);
  });

  it("parses the real Slow Cooker handbook into its 15 sections", () => {
    const md = readFileSync(
      resolve(__dirname, "../../content/handbook/slow-cooker.md"),
      "utf-8",
    );
    const chunks = chunkHandbook(md);
    expect(chunks.length).toBe(15);
    const slugs = chunks.map((c) => c.slug);
    expect(slugs).toContain("illness-policy");
    expect(slugs).toContain("tuition-and-fees");
    expect(slugs).toContain("meals-and-food-allergies");
    // Every chunk has a non-empty body
    for (const c of chunks) {
      expect(c.body.length).toBeGreaterThan(20);
    }
  });
});
