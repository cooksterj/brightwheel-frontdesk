// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { OPEN_CHAT_EVENT, onOpenChat, openChat } from "./open-chat";

describe("openChat / onOpenChat", () => {
  it("exports the expected event name", () => {
    expect(OPEN_CHAT_EVENT).toBe("sunnybrook:open-chat");
  });

  it("dispatches the detail to subscribers", () => {
    const handler = vi.fn();
    const off = onOpenChat(handler);
    openChat({ intent: "tour", source: "hero" });
    expect(handler).toHaveBeenCalledWith({ intent: "tour", source: "hero" });
    off();
  });

  it("defaults to the general intent", () => {
    const handler = vi.fn();
    const off = onOpenChat(handler);
    openChat();
    expect(handler).toHaveBeenCalledWith({ intent: "general" });
    off();
  });

  it("unsubscribes cleanly", () => {
    const handler = vi.fn();
    const off = onOpenChat(handler);
    off();
    openChat({ intent: "lead" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("supports multiple independent subscribers", () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = onOpenChat(a);
    const offB = onOpenChat(b);
    openChat({ intent: "illness" });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    offA();
    offB();
  });
});
