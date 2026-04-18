"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { useChat } from "@/components/chat/useChat";

export default function ChatPage() {
  const { messages, send, isStreaming } = useChat();
  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      <ChatHeader />
      <MessageList messages={messages} />
      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}
