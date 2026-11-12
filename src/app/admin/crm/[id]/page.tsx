import { notFound } from "next/navigation";
import { ContactoFicha } from "@/app/admin/crm/[id]/contacto-ficha";
import { ContactoHeader } from "@/app/admin/crm/[id]/contacto-header";
import { ContactoTabs } from "@/app/admin/crm/[id]/contacto-tabs";
import { HechosPanel } from "@/app/admin/crm/[id]/hechos-panel";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadCrm } from "@/lib/admin/crm/detail";
import { tabQuery } from "@/lib/admin/tab-query";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";
import { crmSourceLabel } from "@/lib/crm-label";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "hechos", label: "Seguimiento" },
];

export default async function CrmDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadCrm(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  const notice = seatFullCopy(query.error) || query.error || "";
  const source = crmSourceLabel(data.contact.source);
  const name = data.person.name;
  return (
    <main className="px-8 py-8">
      <PanelHeader title={name} crumbs={trailCrumbs(parentLabel("/admin/crm"), "/admin/crm", name)} />
      <ContactoHeader person={data.person} status={data.status} source={source} events={data.events.length} />
      {notice ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <ContactoTabs id={id} active={active} events={data.events.length} />
      <div className="mt-6">
        {active === "hechos" ? (
          <HechosPanel id={id} source={data.contact.source} statusCode={data.statusCode} events={data.events} />
        ) : (
          <ContactoFicha id={id} person={data.person} source={source} pass={data.pass} statusCode={data.statusCode} />
        )}
      </div>
    </main>
  );
}
