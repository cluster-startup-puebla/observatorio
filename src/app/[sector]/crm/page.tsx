import { notFound } from "next/navigation";
import { CrmCards } from "@/components/organismo/crm-cards";
import { CrmFilters } from "@/components/organismo/crm-filters";
import { CrmTable } from "@/components/organismo/crm-table";
import { CrmToggle } from "@/components/organismo/crm-toggle";
import { getDirectory } from "@/lib/memory-directory";
import { filterOrgCrm, orgView } from "@/lib/organismo/crm-view";
import { ownerBySlug } from "@/lib/organismo/owner";

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
  const people = filterOrgCrm(await getDirectory().crm(owner.id), vista === "tabla" ? query.estado : undefined);
  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-h2 text-ink">CRM</h1>
        <CrmToggle vista={vista} estado={query.estado} />
      </header>
      {vista === "tarjetas" ? (
        <CrmCards people={people} vista={vista} slug={owner.slug} error={query.error} />
      ) : (
        <div className="grid gap-4">
          <CrmFilters estado={query.estado} />
          <CrmTable people={people} vista={vista} />
        </div>
      )}
    </div>
  );
}
