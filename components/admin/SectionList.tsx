import Link from "next/link";
import type { SectionRow } from "@/lib/handbook/repo";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function SectionList({ sections }: { sections: SectionRow[] }) {
  if (sections.length === 0) {
    return (
      <p className="font-sans text-[14px] text-ink-soft">
        No sections yet. Run <code className="bg-paper-deep px-1">just seed</code>.
      </p>
    );
  }
  return (
    <table className="w-full border-collapse font-sans text-[14px]">
      <thead>
        <tr className="border-b border-paper-edge text-left">
          <th className="py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
            Title
          </th>
          <th className="py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
            Version
          </th>
          <th className="py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute">
            Last edited
          </th>
          <th className="py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-mute" />
        </tr>
      </thead>
      <tbody>
        {sections.map((s) => (
          <tr
            key={s.slug}
            className="border-b border-paper-edge/50 transition-colors hover:bg-cream"
          >
            <td className="py-3 pr-4 text-ink">
              <Link
                href={`/admin/handbook/${s.slug}`}
                className="font-display text-[17px] tracking-tight hover:text-clay"
              >
                {s.title}
              </Link>
            </td>
            <td className="py-3 pr-4 text-ink-soft">v{s.version}</td>
            <td className="py-3 pr-4 text-ink-soft">
              {formatWhen(s.updated_at)}
              {s.updated_by ? (
                <span className="ml-2 text-ink-mute">by {s.updated_by}</span>
              ) : null}
            </td>
            <td className="py-3 text-right">
              <Link
                href={`/admin/handbook/${s.slug}`}
                className="text-clay hover:text-clay-deep"
              >
                Edit →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
