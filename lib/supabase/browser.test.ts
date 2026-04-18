import { describe, expect, it } from "vitest";
import { createBrowserSupabaseClient } from "./browser";

describe("createBrowserSupabaseClient", () => {
  it("returns a client when url and key are provided", () => {
    const client = createBrowserSupabaseClient(
      "https://abc.supabase.co",
      "sb_publishable_test",
    );
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });

  it("throws when url is empty", () => {
    expect(() => createBrowserSupabaseClient("", "key")).toThrow();
  });

  it("throws when publishableKey is empty", () => {
    expect(() => createBrowserSupabaseClient("https://x.supabase.co", "")).toThrow();
  });
});
