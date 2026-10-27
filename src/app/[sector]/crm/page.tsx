import { notFound } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CrmCards } from "@/components/organismo/crm-cards";
import { CrmFilters } from "@/components/organismo/crm-filters";
import { CrmTable } from "@/components/organismo/crm-table";
import { CrmToggle } from "@/components/organismo/crm-toggle";
import { getDirectory } from "@/lib/memory-directory";
import { filterOrgCrm, orgView } from "@/lib/organismo/crm-view";
import { listOrgCrm } from "@/lib/organismo/org-crm-read";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";
import { ownerBySlug } from "@/lib/organismo/owner";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export default async function CrmPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ vista?: string; estado?: string; error?: string }>;
}) {
  const { sector } = await params;
  const query = await searchParams;
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
  const vista = orgView(query.vista);
  const stored = await listOrgCrm(owner.id);
  const people = filterOrgCrm(
    stored ?? (usesSupabaseAuth() ? [] : await getDirectory().crm(owner.id)),
    vista === "tabla" ? query.estado : undefined,
  );
  const notice = seatFullCopy(query.error);
  return (
    <div className="grid gap-6">
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-h2 text-ink">CRM</h1>
        <CrmToggle vista={vista} estado={query.estado} />
      </header>
      {vista === "tarjetas" ? (
        <CrmCards people={people} vista={vista} slug={owner.slug} error={query.error} />
      ) : (
        <div className="grid gap-4">
          <CrmFilters estado={query.estado} />
          <CrmTable people={people} vista={vista} slug={owner.slug} />
        </div>
      )}
    </div>
  );
}
