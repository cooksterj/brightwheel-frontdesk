import type { QuestionRow } from "@/lib/questions/repo";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { IntentBadge } from "./IntentBadge";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function QuestionLog({ rows }: { rows: QuestionRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-paper-edge bg-cream p-6 font-sans text-[14px] text-ink-soft">
        No questions yet.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border border-paper-edge bg-cream">
      <table className="w-full border-collapse font-sans text-[14px]">
        <thead>
          <tr className="border-b border-paper-edge bg-paper-deep/40 text-left">
            <th className="py-3 pl-4 pr-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
              When
            </th>
            <th className="py-3 pr-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
              Question
            </th>
            <th className="py-3 pr-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
              Confidence
            </th>
            <th className="py-3 pr-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
              Intent
            </th>
            <th className="py-3 pr-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
              Cited
            </th>
            <th className="py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-paper-edge/50 last:border-0 align-top"
            >
              <td className="whitespace-nowrap py-3 pl-4 pr-3 text-ink-soft">
                {formatWhen(r.created_at)}
                {r.session_id === "seed" ? (
                  <span className="ml-2 rounded bg-paper-edge/50 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-ink-mute">
                    seed
                  </span>
                ) : null}
              </td>
              <td className="py-3 pr-3 text-ink">
                <span className="block max-w-[46ch]">{r.query}</span>
              </td>
              <td className="py-3 pr-3">
                <ConfidenceBadge confidence={r.confidence} />
              </td>
              <td className="py-3 pr-3">
                <IntentBadge intent={r.intent} />
              </td>
              <td className="py-3 pr-3 text-[13px] text-ink-soft">
                {r.retrieved_slugs.length > 0 ? (
                  <span className="block max-w-[24ch] truncate">
                    {r.retrieved_slugs.slice(0, 2).join(", ")}
                    {r.retrieved_slugs.length > 2
                      ? ` +${r.retrieved_slugs.length - 2}`
                      : ""}
                  </span>
                ) : (
                  <span className="text-ink-mute">—</span>
                )}
              </td>
              <td className="py-3 pr-4 text-[13px]">
                {r.resolved_at ? (
                  <span className="text-sage">✓ resolved</span>
                ) : (
                  <span className="text-ink-mute">open</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
