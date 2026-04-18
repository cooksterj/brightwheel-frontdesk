export function Footer() {
  return (
    <footer className="relative border-t border-paper-edge/60 bg-paper">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-center md:justify-between md:px-12">
        <div className="font-sans text-[13px] text-ink-soft">
          <span className="font-display text-[15px] text-ink">
            Sunnybrook Early Learning
          </span>
          <span className="mx-2 text-paper-edge">·</span>
          Albuquerque, New Mexico
        </div>
        <div className="flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          <span>Powered by</span>
          <span className="font-display text-[14px] normal-case tracking-normal text-ink">
            Brightwheel
          </span>
        </div>
      </div>
    </footer>
  );
}
