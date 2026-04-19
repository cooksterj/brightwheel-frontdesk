import { notFound } from "next/navigation";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { getSection } from "@/lib/handbook/repo";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = await getSection(createAdminSupabase(), slug);
  if (!section) notFound();
  return <SectionEditor initial={section} />;
}
