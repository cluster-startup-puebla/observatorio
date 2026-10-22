import { notFound } from "next/navigation";
import { CrmCards } from "@/components/organismo/crm-cards";
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
  searchParams: Promise<{ vista?: string; estado?: string }>;
}) {
  const { sector } = await params;
  const query = await searchParams;
  const owner = await ownerBySlug(sector);
  if (!owner) notFound();
  const vista = orgView(query.vista);
  const people = filterOrgCrm(await getDirectory().crm(owner.id), query.estado);
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-h2 text-ink">CRM</h1>
      </header>
      <CrmToggle vista={vista} estado={query.estado} />
      {vista === "tarjetas" ? (
        <CrmCards people={people} vista={vista} />
      ) : (
        <CrmTable people={people} vista={vista} />
      )}
    </div>
  );
}
