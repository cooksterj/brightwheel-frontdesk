import Link from "next/link";

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
      <Link
        href="/chat"
        className="relative font-sans text-[14px] text-ink/85 transition-colors hover:text-clay after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:content-[''] hover:after:origin-left hover:after:scale-x-100"
      >
        Chat
      </Link>
    </header>
  );
}
