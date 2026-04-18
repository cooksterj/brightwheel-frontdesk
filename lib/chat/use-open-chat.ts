"use client";

import { useCallback, useEffect } from "react";
import { onOpenChat, openChat, type OpenChatDetail } from "./open-chat";

export function useOpenChat() {
  return useCallback((detail?: OpenChatDetail) => {
    openChat(detail);
  }, []);
}

export function useOpenChatListener(
  handler: (detail: OpenChatDetail) => void,
) {
  useEffect(() => onOpenChat(handler), [handler]);
}
