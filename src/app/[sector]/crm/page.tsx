import { notFound } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CrmCards } from "@/components/organismo/crm-cards";
import { OrgTour } from "@/components/organismo/tour/org-tour";
import { CrmFilters } from "@/components/organismo/crm-filters";
import { CrmSessionSelect } from "@/components/organismo/crm-session-select";
import { CrmTable } from "@/components/organismo/crm-table";
import { CrmToggle } from "@/components/organismo/crm-toggle";
import { getDirectory } from "@/lib/memory-directory";
import { filterOrgCrm, orgView } from "@/lib/organismo/crm-view";
import { crmSessionChoice } from "@/lib/organismo/crm-session-choice";
import { listOrgCrm } from "@/lib/organismo/org-crm-read";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";
import { ownerBySlug } from "@/lib/organismo/owner";
import { redirectLegacyPiece } from "@/lib/sessions/redirect-legacy";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export default async function CrmPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ vista?: string; estado?: string; error?: string; tour?: string; sesion?: string }>;
}) {
  const { sector } = await params;
  const query = await searchParams;
  if (usesSupabaseAuth()) await redirectLegacyPiece(sector, "crm", query);
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
  const vista = orgView(query.vista);
  const { sessions, selectedId } = await crmSessionChoice(query.sesion);
  const stored = await listOrgCrm(owner.id, selectedId);
  const people = filterOrgCrm(
    stored ?? (usesSupabaseAuth() ? [] : await getDirectory().crm(owner.id)),
    vista === "tabla" ? query.estado : undefined,
  );
  const notice = seatFullCopy(query.error);
  return (
    <div className="grid gap-6">
      <OrgTour slug={sector} sessions={0} crm tour={query.tour === "1"} />
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-ink">CRM</h1>
        <CrmToggle vista={vista} estado={query.estado} sesion={query.sesion} />
      </header>
      <CrmSessionSelect sessions={sessions} selectedId={selectedId} vista={vista} estado={query.estado} />
      {vista === "tarjetas" ? (
        <CrmCards people={people} vista={vista} slug={owner.slug} error={query.error} />
      ) : (
        <div className="grid gap-4">
          <CrmFilters estado={query.estado} sesion={query.sesion} />
          <CrmTable people={people} vista={vista} slug={owner.slug} />
        </div>
      )}
    </div>
  );
}
