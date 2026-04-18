import Link from "next/link";

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between border-b border-paper-edge/50 bg-paper px-6 py-5 md:px-12">
      <Link
        href="/"
        className="font-display text-[20px] leading-none tracking-tight text-ink"
      >
        The Slow Cooker
        <span className="ml-2 align-middle text-clay">·</span>
      </Link>
      <Link
        href="/"
        className="font-sans text-[11px] uppercase tracking-[0.28em] text-ink-mute transition-colors hover:text-ink"
      >
        ← Home
      </Link>
    </header>
  );
}
