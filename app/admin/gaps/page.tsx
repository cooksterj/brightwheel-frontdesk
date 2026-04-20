import Link from "next/link";
import { GapDashboard } from "@/components/admin/GapDashboard";

export const dynamic = "force-dynamic";

export default function GapsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[36px] leading-tight tracking-tight text-ink">
          Knowledge gaps
        </h1>
        <p className="mt-2 max-w-[68ch] font-sans text-[14px] text-ink-soft">
          Parent questions the chat couldn't answer confidently, clustered by
          topic. Each cluster comes with a drafted handbook section you can
          edit and merge in one click.
        </p>
        <p className="mt-3 max-w-[72ch] font-sans text-[13px] leading-[1.55] text-ink-mute">
          <span className="font-medium text-ink-soft">A cluster needs at
          least two related questions</span> before it shows up here. If
          only one parent has asked about a topic, it won't surface as a
          gap yet. To see every low-confidence question individually
          (including one-offs), open{" "}
          <Link
            href="/admin/questions?confidence=low"
            className="text-clay underline-offset-2 hover:text-clay-deep hover:underline"
          >
            Questions filtered to low
          </Link>
          .
        </p>
      </div>
      <GapDashboard />
    </div>
  );
}
