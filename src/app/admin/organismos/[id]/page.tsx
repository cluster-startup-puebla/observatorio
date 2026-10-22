import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { FormSheet } from "@/components/admin/form-sheet";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadOrganismo } from "@/lib/admin/organismos/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
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
  searchParams: Promise<{ tab?: string; error?: string; enlace?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadOrganismo(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "miembros");
  return (
    <DetailFrame
      title={data.org.name ?? id}
      backHref="/admin/organismos"
      facts={[
        { label: "Color", value: data.org.brand_color ?? "" },
        { label: "Marca", value: data.org.brand_completed_at ? "Lista" : "Incompleta" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error && !query.tab ? <p className="text-small text-mark">{query.error}</p> : null}
      <FormSheet action="Editar" resource="organismo" open={Boolean(query.error) && !query.tab}>
        <form action={`/api/admin/organismos/${id}`} method="post" className="grid gap-3">
          <input name="name" defaultValue={data.org.name ?? ""} className="rounded-lg border border-line px-3 py-2" />
          <input name="brand_color" defaultValue={data.org.brand_color ?? ""} className="rounded-lg border border-line px-3 py-2" />
          <button className="btn btn-primary" type="submit">
            Guardar nombre y color
          </button>
        </form>
      </FormSheet>
      <OrganismoTabs id={id} active={active} data={data} enlace={query.enlace} />
    </DetailFrame>
  );
}
