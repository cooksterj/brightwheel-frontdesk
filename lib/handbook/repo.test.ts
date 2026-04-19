import { describe, expect, it, vi } from "vitest";
import { getSection, listSections, updateSection } from "./repo";

function makeClient(handlers: {
  from: (table: string) => unknown;
}) {
  return handlers as never;
}

describe("listSections", () => {
  it("selects live (non-deleted) sections ordered by title", async () => {
    const order = vi.fn(async () => ({
      data: [{ slug: "illness-policy", title: "Illness Policy", body: "…", version: 1 }],
      error: null,
    }));
    const is = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ is }));
    const from = vi.fn(() => ({ select }));
    const client = makeClient({ from });

    const rows = await listSections(client);
    expect(from).toHaveBeenCalledWith("handbook_sections");
    expect(is).toHaveBeenCalledWith("deleted_at", null);
    expect(order).toHaveBeenCalledWith("title", { ascending: true });
    expect(rows).toHaveLength(1);
  });

  it("throws on supabase error", async () => {
    const order = vi.fn(async () => ({ data: null, error: { message: "boom" } }));
    const client = makeClient({
      from: () => ({ select: () => ({ is: () => ({ order }) }) }),
    });
    await expect(listSections(client)).rejects.toThrow(/boom/);
  });
});

describe("getSection", () => {
  it("fetches a single non-deleted section by slug", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: { slug: "illness-policy", title: "Illness Policy", body: "…", version: 2 },
      error: null,
    }));
    const is = vi.fn(() => ({ maybeSingle }));
    const eq = vi.fn(() => ({ is }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const client = makeClient({ from });

    const row = await getSection(client, "illness-policy");
    expect(eq).toHaveBeenCalledWith("slug", "illness-policy");
    expect(row?.slug).toBe("illness-policy");
  });

  it("returns null when no section matches", async () => {
    const client = makeClient({
      from: () => ({
        select: () => ({
          eq: () => ({ is: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        }),
      }),
    });
    expect(await getSection(client, "nope")).toBeNull();
  });
});

describe("updateSection", () => {
  it("snapshots then updates with incremented version", async () => {
    // getSection first call
    const getMaybeSingle = vi.fn(async () => ({
      data: {
        id: "uuid-1",
        slug: "illness-policy",
        title: "Illness Policy",
        body: "old",
        version: 3,
      },
      error: null,
    }));
    const snapInsert = vi.fn(async () => ({ error: null }));
    const updSingle = vi.fn(async () => ({
      data: {
        id: "uuid-1",
        slug: "illness-policy",
        title: "Illness Policy",
        body: "new",
        version: 4,
      },
      error: null,
    }));
    const updSelect = vi.fn(() => ({ single: updSingle }));
    const updEq = vi.fn(() => ({ select: updSelect }));
    const update = vi.fn(() => ({ eq: updEq }));

    const from = vi.fn((table: string) => {
      if (table === "handbook_sections") {
        return {
          select: () => ({
            eq: () => ({ is: () => ({ maybeSingle: getMaybeSingle }) }),
          }),
          update,
        };
      }
      if (table === "handbook_section_versions") {
        return { insert: snapInsert };
      }
      throw new Error(`unexpected table: ${table}`);
    });

    const row = await updateSection(makeClient({ from }), "illness-policy", {
      title: "Illness Policy",
      body: "new",
      embedding: [0.1, 0.2],
      editor: "admin",
    });

    expect(snapInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        section_id: "uuid-1",
        version: 3,
        archived_by: "admin",
      }),
    );
    const updateArg = (update.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(updateArg.version).toBe(4);
    expect(updateArg.body).toBe("new");
    expect(row.version).toBe(4);
  });

  it("throws when the slug doesn't exist", async () => {
    const from = vi.fn(() => ({
      select: () => ({
        eq: () => ({ is: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      }),
    }));
    await expect(
      updateSection(makeClient({ from }), "nope", {
        title: "x",
        body: "y",
        embedding: [0.1],
      }),
    ).rejects.toThrow(/no section with slug/);
  });
});
