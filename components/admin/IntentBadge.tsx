export function IntentBadge({ intent }: { intent: string | null }) {
  if (!intent) return null;
  const tone =
    intent === "emergency"
      ? "bg-clay-deep text-paper"
      : intent === "illness"
        ? "bg-butter text-ink"
        : intent === "tour"
          ? "bg-sage/40 text-ink"
          : "bg-paper-edge/50 text-ink-soft";
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.2em] ${tone}`}
    >
      {intent}
    </span>
  );
}
