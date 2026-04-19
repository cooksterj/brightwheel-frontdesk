export function ConfidenceBadge({ confidence }: { confidence: string | null }) {
  const tone =
    confidence === "high"
      ? "bg-sage/20 text-[#4a5a3a]"
      : confidence === "medium"
        ? "bg-paper-deep text-ink-soft"
        : confidence === "low"
          ? "bg-clay/15 text-clay-deep"
          : "bg-paper-deep text-ink-mute";
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.22em] ${tone}`}
    >
      {confidence ?? "unknown"}
    </span>
  );
}
