import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_CHARS,
  MAX_MESSAGES,
  MAX_MESSAGE_CHARS,
  validateMessageLimits,
} from "./limits";

const msg = (content: string) => ({ role: "user", content });

describe("validateMessageLimits", () => {
  it("passes for a normal conversation", () => {
    expect(
      validateMessageLimits([
        msg("how long do kids stay home with a fever?"),
        { role: "assistant", content: "24 hours fever-free [§ Illness]" },
        msg("thanks"),
      ]),
    ).toBeNull();
  });

  it("rejects when a single message exceeds the per-message cap", () => {
    const tooBig = "a".repeat(MAX_MESSAGE_CHARS + 1);
    const v = validateMessageLimits([msg(tooBig)]);
    expect(v).toEqual(
      expect.objectContaining({ limit: "message_chars" }),
    );
  });

  it("rejects when history totals exceed MAX_HISTORY_CHARS", () => {
    const justUnder = "x".repeat(MAX_MESSAGE_CHARS);
    const many = Array.from(
      { length: Math.ceil(MAX_HISTORY_CHARS / MAX_MESSAGE_CHARS) + 2 },
      () => msg(justUnder),
    ).slice(0, 30); // keep within count cap so we hit history cap first
    const v = validateMessageLimits(many);
    expect(v?.limit).toBe("history_chars");
  });

  it("rejects when message count exceeds MAX_MESSAGES", () => {
    const many = Array.from({ length: MAX_MESSAGES + 1 }, () => msg("hi"));
    expect(validateMessageLimits(many)?.limit).toBe("message_count");
  });

  it("rejects when a message has non-string content", () => {
    const bad = [{ role: "user", content: 123 as unknown as string }];
    expect(validateMessageLimits(bad)?.limit).toBe("shape");
  });

  it("allows empty content strings (trimmed elsewhere)", () => {
    expect(validateMessageLimits([msg("")])).toBeNull();
  });
});
