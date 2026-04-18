"use client";

import type { ReactNode } from "react";
import type { ChatIntent } from "@/lib/chat/open-chat";
import { useOpenChat } from "@/lib/chat/use-open-chat";

type Variant = "primary" | "secondary" | "quiet" | "quiet-light" | "dusk";

const base =
  "group inline-flex items-center gap-2 cursor-pointer transition-colors duration-200";

const variants: Record<Variant, string> = {
  primary:
    "rounded-full bg-clay px-7 py-3.5 font-sans text-[12px] uppercase tracking-[0.22em] text-paper hover:bg-clay-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-deep focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  secondary:
    "rounded-full border border-ink/80 px-7 py-3.5 font-sans text-[12px] uppercase tracking-[0.22em] text-ink hover:bg-ink hover:text-paper",
  quiet:
    "relative font-sans text-[15px] text-ink/85 hover:text-clay after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:content-[''] hover:after:origin-left hover:after:scale-x-100",
  "quiet-light":
    "relative font-sans text-[15px] text-paper/70 hover:text-paper after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:content-[''] hover:after:origin-left hover:after:scale-x-100",
  dusk:
    "rounded-full bg-clay px-9 py-4 font-sans text-[13px] uppercase tracking-[0.22em] text-paper shadow-[0_24px_48px_-22px_rgba(184,83,60,0.75)] hover:bg-clay-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-soft focus-visible:ring-offset-4 focus-visible:ring-offset-dusk",
};

export function AskButton({
  variant = "primary",
  intent = "general",
  source,
  children,
}: {
  variant?: Variant;
  intent?: ChatIntent;
  source?: string;
  children: ReactNode;
}) {
  const open = useOpenChat();
  return (
    <button
      type="button"
      onClick={() => open({ intent, source })}
      className={`${base} ${variants[variant]}`}
    >
      {children}
      <span
        aria-hidden
        className="inline-block translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}
