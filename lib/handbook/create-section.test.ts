import { describe, expect, it, vi } from "vitest";
import { createSection } from "./create-section";

function mockClient(handlers: { from: (table: string) => unknown }) {
  return handlers as never;
}

describe("createSection", () => {
  it("inserts a new section with the slugified title", async () => {
    const single = vi.fn(async () => ({
      data: {
        id: "uuid-1",
        slug: "summer-programs",
        title: "Summer Programs",
        body: "…",
        version: 1,
      },
      error: null,
    }));
    const insertSelect = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select: insertSelect }));

    const lookupMaybeSingle = vi.fn(async () => ({ data: null, error: null }));
    const lookupEq = vi.fn(() => ({ maybeSingle: lookupMaybeSingle }));
    const lookupSelect = vi.fn(() => ({ eq: lookupEq }));

    const from = vi.fn(() => ({ select: lookupSelect, insert }));
    const client = mockClient({ from });

    const row = await createSection(client, {
      title: "Summer Programs",
      body: "Our summer program...",
      embedding: [0.1, 0.2],
      editor: "admin",
    });

    expect(lookupEq).toHaveBeenCalledWith("slug", "summer-programs");
    const insertArg = (insert.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(insertArg.slug).toBe("summer-programs");
    expect(insertArg.title).toBe("Summer Programs");
    expect(row.slug).toBe("summer-programs");
  });

  it("appends a numeric suffix if the slug is already taken", async () => {
    const single = vi.fn(async () => ({
      data: { id: "uuid-2", slug: "summer-programs-1", title: "Summer Programs", body: "…", version: 1 },
      error: null,
    }));
    const insertSelect = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select: insertSelect }));

    // First lookup: slug exists. Second lookup: free.
    let lookupCount = 0;
    const lookupMaybeSingle = vi.fn(async () => {
      lookupCount += 1;
      return lookupCount === 1
        ? { data: { id: "existing" }, error: null }
        : { data: null, error: null };
    });
    const lookupEq = vi.fn(() => ({ maybeSingle: lookupMaybeSingle }));
    const lookupSelect = vi.fn(() => ({ eq: lookupEq }));

    const from = vi.fn(() => ({ select: lookupSelect, insert }));
    await createSection(mockClient({ from }), {
      title: "Summer Programs",
      body: "…",
      embedding: [0.1],
    });

    expect(lookupEq).toHaveBeenNthCalledWith(1, "slug", "summer-programs");
    expect(lookupEq).toHaveBeenNthCalledWith(2, "slug", "summer-programs-1");
  });

  it("throws when the title can't produce a slug", async () => {
    const from = vi.fn(() => ({}));
    await expect(
      createSection(mockClient({ from }), {
        title: "!!!",
        body: "…",
        embedding: [0.1],
      }),
    ).rejects.toThrow(/empty slug/);
  });
});
