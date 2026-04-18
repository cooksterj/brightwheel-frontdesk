import Link from "next/link";
import type { ReactNode } from "react";

type Size = "sm" | "md";

const sizeClass: Record<Size, string> = {
  sm: "px-5 py-2.5 text-[11px]",
  md: "px-7 py-3.5 text-[12px]",
};

/**
 * Primary landing-page CTA. Always routes to /chat. Two sizes:
 * - `sm` (nav pill)
 * - `md` (hero / in-flow CTA, default)
 */
export function ChatCTA({
  size = "md",
  children = "Ask us anything",
}: {
  size?: Size;
  children?: ReactNode;
}) {
  return (
    <Link
      href="/chat"
      className={`group inline-flex items-center gap-2 rounded-full bg-clay font-sans uppercase tracking-[0.22em] text-paper transition-colors hover:bg-clay-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-deep focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${sizeClass[size]}`}
    >
      {children}
      <span
        aria-hidden
        className="inline-block translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
