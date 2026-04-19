import { createClient } from "@supabase/supabase-js";
import { SectionList } from "@/components/admin/SectionList";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import { listSections } from "@/lib/handbook/repo";

export const dynamic = "force-dynamic";

export default async function HandbookIndex() {
  const server = getServerEnv();
  const pub = getPublicEnv();
  const supabase = createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );
  const sections = await listSections(supabase);

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
