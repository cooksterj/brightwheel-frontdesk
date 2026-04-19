import Link from "next/link";
import { QuestionLog } from "@/components/admin/QuestionLog";
import { listQuestions, summarize } from "@/lib/questions/repo";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const FILTERS: Array<{ value: "all" | "high" | "medium" | "low"; label: string }> = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function isFilterValue(v: string | undefined): v is "high" | "medium" | "low" {
  return v === "high" || v === "medium" || v === "low";
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ confidence?: string }>;
}) {
  const { confidence } = await searchParams;
  const active: "all" | "high" | "medium" | "low" = isFilterValue(confidence)
    ? confidence
    : "all";

  const supabase = createAdminSupabase();
  const rows = await listQuestions(supabase, {
    confidence: active === "all" ? undefined : active,
    limit: 200,
  });
  const allRows = active === "all" ? rows : await listQuestions(supabase);
  const stats = summarize(allRows);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[36px] leading-tight tracking-tight text-ink">
          Questions
        </h1>
        <p className="mt-2 max-w-[66ch] font-sans text-[14px] text-ink-soft">
          Everything parents have asked the chat, newest first. Confident
          answers (high) are the quick wins; medium and low surface as
          clusters over on{" "}
          <Link
            href="/admin/gaps"
            className="text-clay underline-offset-2 hover:text-clay-deep hover:underline"
          >
            knowledge gaps
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[12px] uppercase tracking-[0.22em] text-ink-mute">
        <span>
          <span className="font-medium text-ink">{stats.total}</span> total
        </span>
        <span>
          <span className="font-medium text-[#4a5a3a]">{stats.high}</span> high
        </span>
        <span>
          <span className="font-medium text-ink-soft">{stats.medium}</span> medium
        </span>
        <span>
          <span className="font-medium text-clay-deep">{stats.low}</span> low
        </span>
        {stats.emergency > 0 ? (
          <span>
            <span className="font-medium text-clay-deep">{stats.emergency}</span>{" "}
            emergency
          </span>
        ) : null}
        <span>
          <span className="font-medium text-sage">{stats.resolved}</span> resolved
        </span>
      </div>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const href = f.value === "all" ? "/admin/questions" : `/admin/questions?confidence=${f.value}`;
          const isActive = active === f.value;
          return (
            <Link
              key={f.value}
              href={href}
              className={`inline-flex rounded-full px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.22em] transition-colors ${
                isActive
                  ? "bg-ink text-paper"
                  : "border border-paper-edge text-ink-soft hover:border-clay hover:text-clay"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <QuestionLog rows={rows} />
    </div>
  );
}
