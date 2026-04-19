import Link from "next/link";
import { ChatCTA } from "./ChatCTA";

export function Navbar() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 pt-8 sm:px-8 md:px-12 md:pt-10">
      <Link
        href="/"
        className="font-display text-[22px] leading-none tracking-tight text-ink"
      >
        The Slow Cooker
        <span className="ml-2 align-middle text-clay">·</span>
      </Link>
      <nav className="flex items-center gap-5 sm:gap-7">
        <Link
          href="/admin"
          className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink-mute transition-colors hover:text-ink"
        >
          Admin
        </Link>
        <ChatCTA size="sm" />
      </nav>
    </header>
  );
}
