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
          topic. Each cluster gets a Claude-drafted handbook section you can
          edit and merge in one click.
        </p>
      </div>
      <GapDashboard />
    </div>
  );
}
