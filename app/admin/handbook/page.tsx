import { SectionList } from "@/components/admin/SectionList";
import { listSections } from "@/lib/handbook/repo";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HandbookIndex() {
  const sections = await listSections(createAdminSupabase());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[36px] leading-tight tracking-tight text-ink">
          Handbook
        </h1>
        <p className="mt-2 font-sans text-[14px] text-ink-soft">
          {sections.length} section{sections.length === 1 ? "" : "s"}.
          Changes save immediately — the chat picks them up on the next query.
        </p>
      </div>
      <SectionList sections={sections} />
    </div>
  );
}
