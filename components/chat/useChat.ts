"use client";

import { useCallback, useState } from "react";
import { readTextStream } from "@/lib/chat/stream-reader";
import type { Message, Role } from "@/lib/chat/types";

const API_PATH = "/api/chat";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      const history = [...messages, userMessage];
      setMessages([...history, assistantMessage]);
      setIsStreaming(true);

      try {
        const response = await fetch(API_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map<{ role: Role; content: string }>((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`chat request failed with status ${response.status}`);
        }

        for await (const chunk of readTextStream(response)) {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
            return copy;
          });
        }
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content:
              "Sorry — something went wrong reaching the kitchen. Please try again.",
          };
          return copy;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages],
  );

  return { messages, send, isStreaming };
}
