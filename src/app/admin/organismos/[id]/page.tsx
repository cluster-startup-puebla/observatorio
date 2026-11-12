import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadOrganismo } from "@/lib/admin/organismos/detail";
import { listOrganismoCrm } from "@/lib/admin/organismos/crm";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { OrganismoCrmTab } from "@/app/admin/organismos/[id]/crm-tab";
import { OrganismoTabs } from "@/app/admin/organismos/[id]/tabs";

export const instant = false;

const tabs = [
  { value: "miembros", label: "Miembros" },
  { value: "crm", label: "CRM" },
  { value: "enlace", label: "Enlace" },
  { value: "logo", label: "Logo" },
];

export default async function OrganismoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string; enlace?: string; page?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadOrganismo(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "miembros");
  const crm = active === "crm" ? await listOrganismoCrm(id, query.page) : null;
  return (
    <DetailFrame
      title={data.org.name ?? id}
      backHref="/admin/organismos"
      facts={[
        { label: "Color", value: data.org.brand_color ?? "" },
        { label: "Marca", value: data.org.brand_completed_at ? "Lista" : "Incompleta" },
      ]}
      tabs={tabs.map((tab) => (tab.value === "crm" ? { ...tab, count: data.contactCount } : tab))}
      active={active}
    >
      {data.logo ? (
        <img
          src={`/api/admin/organismos/${id}/logo`}
          alt={`Logo de ${data.org.name ?? "organismo"}`}
          className="mb-4 size-16 rounded-xl border border-line bg-elevated object-contain"
        />
      ) : (
        <p className="mb-4 text-small text-ink-secondary">Sin logo.</p>
      )}
      {crm ? (
        <OrganismoCrmTab id={id} rows={crm.rows} page={crm.page} total={crm.total} />
      ) : (
        <OrganismoTabs id={id} active={active} data={data} enlace={query.enlace} />
      )}
    </DetailFrame>
  );
}
