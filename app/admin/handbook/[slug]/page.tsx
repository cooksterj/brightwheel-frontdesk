import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import { getSection } from "@/lib/handbook/repo";

export const dynamic = "force-dynamic";

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const server = getServerEnv();
  const pub = getPublicEnv();
  const supabase = createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );
  const section = await getSection(supabase, slug);
  if (!section) notFound();
  return <SectionEditor initial={section} />;
}
