import { AskButton } from "./AskButton";

export function Navbar() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 pt-8 sm:px-8 md:px-12 md:pt-10">
      <a
        href="/"
        className="font-display text-[22px] leading-none tracking-tight text-ink"
      >
        Sunnybrook
        <span className="ml-2 align-middle text-clay">·</span>
      </a>
      <AskButton variant="quiet" source="navbar">
        Ask us anything
      </AskButton>
    </header>
  );
}
