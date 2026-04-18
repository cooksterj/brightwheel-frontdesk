/**
 * Shape-checks on the incoming chat request body. A determined caller can
 * still send plenty of traffic — rate limiting is the layer that handles
 * volume. These limits cut off the degenerate cases (a 32k-token single
 * message, or 10k history messages in one call).
 */

export const MAX_MESSAGE_CHARS = 1_000;
export const MAX_HISTORY_CHARS = 20_000;
export const MAX_MESSAGES = 40;

export interface LimitViolation {
  reason: string;
  limit: "message_chars" | "history_chars" | "message_count" | "shape";
}

export function validateMessageLimits(
  messages: ReadonlyArray<{ role: string; content: unknown }>,
): LimitViolation | null {
  if (messages.length > MAX_MESSAGES) {
    return {
      reason: `too many messages (${messages.length} > ${MAX_MESSAGES})`,
      limit: "message_count",
    };
  }

  let total = 0;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (typeof m.content !== "string") {
      return {
        reason: `message[${i}].content must be a string`,
        limit: "shape",
      };
    }
    if (m.content.length > MAX_MESSAGE_CHARS) {
      return {
        reason: `message[${i}] is too long (${m.content.length} > ${MAX_MESSAGE_CHARS} chars)`,
        limit: "message_chars",
      };
    }
    total += m.content.length;
  }

  if (total > MAX_HISTORY_CHARS) {
    return {
      reason: `conversation too long (${total} > ${MAX_HISTORY_CHARS} chars)`,
      limit: "history_chars",
    };
  }

  return null;
}
