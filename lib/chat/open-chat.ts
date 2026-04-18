export type ChatIntent =
  | "general"
  | "tour"
  | "illness"
  | "emergency"
  | "lead";

export const OPEN_CHAT_EVENT = "sunnybrook:open-chat";

export interface OpenChatDetail {
  intent: ChatIntent;
  source?: string;
  prefill?: string;
}

const DEFAULT_DETAIL: OpenChatDetail = { intent: "general" };

export function openChat(detail: OpenChatDetail = DEFAULT_DETAIL): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail }),
  );
}

export function onOpenChat(
  handler: (detail: OpenChatDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<OpenChatDetail>).detail);
  window.addEventListener(OPEN_CHAT_EVENT, listener);
  return () => window.removeEventListener(OPEN_CHAT_EVENT, listener);
}
