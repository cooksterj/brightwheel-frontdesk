import { describe, expect, it } from "vitest";
import { isAllowedOrigin } from "./origin";

describe("isAllowedOrigin", () => {
  it("accepts the production alias", () => {
    expect(isAllowedOrigin("https://brightwheelfrontdesk.vercel.app")).toBe(true);
  });

  it("accepts Vercel preview deploys of this project", () => {
    expect(
      isAllowedOrigin(
        "https://brightwheelfrontdesk-iobfkb69m-cooksterjs-projects.vercel.app",
      ),
    ).toBe(true);
  });

  it("rejects other Vercel projects", () => {
    expect(
      isAllowedOrigin("https://some-other-project.vercel.app"),
    ).toBe(false);
  });

  it("accepts localhost over http", () => {
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:3000")).toBe(true);
  });

  it("rejects plain http for production-looking hosts", () => {
    expect(isAllowedOrigin("http://brightwheelfrontdesk.vercel.app")).toBe(false);
  });

  it("rejects unrelated hosts", () => {
    expect(isAllowedOrigin("https://evil.example.com")).toBe(false);
  });

  it("rejects null or empty origins", () => {
    expect(isAllowedOrigin(null)).toBe(false);
    expect(isAllowedOrigin(undefined)).toBe(false);
    expect(isAllowedOrigin("")).toBe(false);
  });

  it("rejects non-URL strings", () => {
    expect(isAllowedOrigin("brightwheelfrontdesk.vercel.app")).toBe(false);
    expect(isAllowedOrigin("javascript:alert(1)")).toBe(false);
  });

  it("allows everything when allowAll is set (development)", () => {
    expect(isAllowedOrigin("https://evil.example.com", { allowAll: true })).toBe(true);
    expect(isAllowedOrigin(null, { allowAll: true })).toBe(true);
  });

  it("is case-insensitive on host", () => {
    expect(
      isAllowedOrigin("https://BrightWheelFrontDesk.vercel.app"),
    ).toBe(true);
  });
});
