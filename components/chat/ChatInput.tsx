"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border-t border-paper-edge/50 bg-paper px-6 py-6 md:px-12"
    >
      <div className="mx-auto flex max-w-[900px] items-end gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask a question…"
          aria-label="Message"
          disabled={disabled}
          className="min-h-[48px] max-h-[200px] flex-1 resize-none rounded-2xl border border-paper-edge bg-cream px-4 py-3 font-sans text-[15px] leading-[1.4] text-ink placeholder:text-ink-mute focus:border-clay focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex h-[48px] items-center gap-2 rounded-full bg-clay px-6 font-sans text-[12px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}
