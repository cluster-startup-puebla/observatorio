import { notFound } from "next/navigation";
import { OrganismoScreen } from "@/app/admin/organismos/[id]/organismo-screen";
import { organismoTabs } from "@/app/admin/organismos/[id]/organismo-tab-nav";
import { listCrm } from "@/lib/admin/crm/list";
import { crmEstado, crmOrigen, crmVista } from "@/lib/admin/crm/query";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadOrganismo } from "@/lib/admin/organismos/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function OrganismoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string; enlace?: string; page?: string; vista?: string; estado?: string; origen?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadOrganismo(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, organismoTabs.map((tab) => tab.value), "miembros");
  const vista = crmVista(query.vista);
  const estado = crmEstado(query.estado);
  const origen = crmOrigen(query.origen);
  const crm = active === "crm" ? await listCrm(query.page, { estado, origen, all: vista === "tarjetas", organizationId: id }) : null;
  return <OrganismoScreen id={id} data={data} active={active} enlace={query.enlace} crm={crm} vista={vista} estado={estado} origen={origen} />;
}
