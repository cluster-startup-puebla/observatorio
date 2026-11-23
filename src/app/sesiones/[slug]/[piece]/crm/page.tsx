import { CrmCards } from "@/components/organismo/crm-cards";
import { CrmFilters } from "@/components/organismo/crm-filters";
import { CrmSessionSelect } from "@/components/organismo/crm-session-select";
import { CrmTable } from "@/components/organismo/crm-table";
import { CrmToggle } from "@/components/organismo/crm-toggle";
import { OrgTour } from "@/components/organismo/tour/org-tour";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";
import { getDirectory } from "@/lib/memory-directory";
import { filterOrgCrm, orgView } from "@/lib/organismo/crm-view";
import { crmSessionChoice } from "@/lib/organismo/crm-session-choice";
import { listOrgCrm } from "@/lib/organismo/org-crm-read";
import { requirePieceOwner } from "@/lib/sessions/require-session";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export default async function CrmPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; piece: string }>;
  searchParams: Promise<{ vista?: string; estado?: string; error?: string; tour?: string; sesion?: string }>;
}) {
  const { slug, piece } = await params;
  const { session, owner } = await requirePieceOwner(slug, piece);
  const query = await searchParams;
  const vista = orgView(query.vista);
  const { sessions, selectedId } = await crmSessionChoice(query.sesion, session.publicSlug);
  const stored = await listOrgCrm(owner.id, selectedId);
  const people = filterOrgCrm(
    stored ?? (usesSupabaseAuth() ? [] : await getDirectory().crm(owner.id)),
    vista === "tabla" ? query.estado : undefined,
  );
  const notice = seatFullCopy(query.error);
  return (
    <div className="grid gap-6">
      <OrgTour
        slug={owner.slug}
        sessionSlug={session.publicSlug}
        sessions={0}
        crm
        tour={query.tour === "1"}
      />
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
        <CrmCards
          people={people}
          vista={vista}
          slug={owner.slug}
          error={query.error}
          sessionSlug={session.publicSlug}
        />
      ) : (
        <div className="grid gap-4">
          <CrmFilters estado={query.estado} sesion={query.sesion} />
          <CrmTable people={people} vista={vista} slug={owner.slug} sessionSlug={session.publicSlug} />
        </div>
      )}
    </div>
  );
}
