import { CrmList } from "@/app/admin/crm/crm-list";
import { adminDb } from "@/lib/admin/admin-db";
import { listCrm } from "@/lib/admin/crm/list";
import { crmEstado, crmOrigen, crmVista } from "@/lib/admin/crm/query";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; vista?: string; estado?: string; origen?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const vista = crmVista(params.vista);
  const estado = crmEstado(params.estado);
  const origen = crmOrigen(params.origen);
  const data = await listCrm(params.page, { estado, origen, all: vista === "tarjetas" });
  const db = await adminDb();
  const orgs = db ? await db.from("organizations").select("id, name").order("name") : { data: [], error: null };
  if (orgs.error) throw new Error(orgs.error.message);
  return (
    <CrmList
      rows={data.rows}
      page={data.page}
      error={params.error}
      orgs={(orgs.data ?? []).map((org) => ({ id: org.id, name: org.name ?? org.id }))}
      vista={vista}
      estado={estado}
      origen={origen}
    />
  );
}
