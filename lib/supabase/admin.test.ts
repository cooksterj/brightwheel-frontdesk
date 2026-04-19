import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAdminSupabase } from "./admin";

describe("createAdminSupabase", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    process.env.DATABASE_URL = "postgresql://u:p@h:5432/d";
    process.env.VOYAGE_API_KEY = "pa-test";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns a Supabase-shaped client (from + rpc are functions)", () => {
    const client = createAdminSupabase();
    expect(typeof client.from).toBe("function");
    expect(typeof client.rpc).toBe("function");
  });

  it("throws when server env is missing", () => {
    delete process.env.SUPABASE_SECRET_KEY;
    expect(() => createAdminSupabase()).toThrow();
  });
});
