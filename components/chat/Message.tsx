import type { Message as MessageType } from "@/lib/chat/types";

export function Message({ message }: { message: MessageType }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-5 py-3 font-sans text-[15px] leading-[1.55] ${
          isUser
            ? "bg-clay text-paper"
            : "border border-paper-edge/70 bg-cream text-ink"
        }`}
      >
        {message.content || (
          !isUser ? (
            <span className="inline-flex items-center gap-1 text-ink-mute">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
