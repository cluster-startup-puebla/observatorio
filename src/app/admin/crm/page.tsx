import { CrmList } from "@/app/admin/crm/crm-list";
import { adminDb } from "@/lib/admin/admin-db";
import { listCrm } from "@/lib/admin/crm/list";
import { loadPathPending } from "@/lib/admin/crm/load-path-pending";
import { crmEstado, crmOrigen, crmVista } from "@/lib/admin/crm/query";
import { loadSessionChoices } from "@/lib/admin/tablero/session-choices";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";

export const instant = false;

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    error?: string;
    vista?: string;
    estado?: string;
    origen?: string;
    sesion?: string;
  }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const vista = crmVista(params.vista);
  const estado = crmEstado(params.estado);
  const origen = crmOrigen(params.origen);
  const sesion = params.sesion?.trim() || null;
  const [data, pending, choices] = await Promise.all([
    listCrm(params.page, { estado, origen, all: vista === "tarjetas", sessionId: sesion ?? undefined }),
    loadPathPending(),
    loadSessionChoices(),
  ]);
  const db = await adminDb();
  const orgs = db ? await db.from("organizations").select("id, name").order("name") : { data: [], error: null };
  if (orgs.error) throw new Error(orgs.error.message);
  return (
    <CrmList
      rows={data.rows}
      page={data.page}
      total={data.total}
      error={seatFullCopy(params.error) || params.error}
      pending={pending}
      orgs={(orgs.data ?? []).map((org) => ({ id: org.id, name: org.name ?? org.id }))}
      vista={vista}
      estado={estado}
      origen={origen}
      sesion={sesion}
      choices={choices}
    />
  );
}
