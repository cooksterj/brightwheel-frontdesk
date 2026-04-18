"use client";

import { useEffect, useRef } from "react";
import type { Message as MessageType } from "@/lib/chat/types";
import { Message } from "./Message";

export function MessageList({ messages }: { messages: MessageType[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="max-w-[36ch] text-center font-display text-[24px] italic leading-[1.35] text-ink-soft md:text-[30px]">
          Ask about anything in our family handbook.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-8 md:px-12">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        <div ref={bottomRef} aria-hidden />
      </div>
    </div>
  );
}
