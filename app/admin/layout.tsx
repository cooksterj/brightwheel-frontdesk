import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-paper">
      <header className="border-b border-paper-edge/60 bg-paper px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <Link
            href="/admin"
            className="font-display text-[20px] tracking-tight text-ink"
          >
            The Slow Cooker
            <span className="ml-2 text-clay">·</span>
            <span className="ml-2 text-ink-mute text-[14px] tracking-normal">
              admin
            </span>
          </Link>
          <Link
            href="/"
            className="font-sans text-[11px] uppercase tracking-[0.28em] text-ink-mute hover:text-ink"
          >
            ← Public site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-6 py-10 md:px-10">
        {children}
      </main>
    </div>
  );
}
