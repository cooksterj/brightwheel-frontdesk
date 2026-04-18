import { describe, expect, it } from "vitest";
import { parsePublicEnv, parseServerEnv } from "./env";

describe("parseServerEnv", () => {
  const valid = {
    ANTHROPIC_API_KEY: "sk-ant-api03-xxx",
    SUPABASE_SECRET_KEY: "sb_secret_xxx",
    DATABASE_URL: "postgresql://user:pass@host:5432/db",
    VOYAGE_API_KEY: "pa-xxx",
  };

  it("parses a complete server env", () => {
    expect(parseServerEnv(valid)).toEqual(valid);
  });

  it("throws when a required key is missing", () => {
    const { ANTHROPIC_API_KEY: _, ...partial } = valid;
    expect(() => parseServerEnv(partial)).toThrow();
  });

  it("throws when DATABASE_URL is not a URL", () => {
    expect(() => parseServerEnv({ ...valid, DATABASE_URL: "not-a-url" })).toThrow();
  });
});

describe("parsePublicEnv", () => {
  const valid = {
    NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_xxx",
  };

  it("parses a complete public env", () => {
    expect(parsePublicEnv(valid)).toEqual(valid);
  });

  it("throws when the URL is malformed", () => {
    expect(() =>
      parsePublicEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "nope" }),
    ).toThrow();
  });
});
