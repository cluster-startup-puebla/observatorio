import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { crmEstado, crmOrigen } from "@/lib/admin/crm/query";
import { pageQuery } from "@/lib/admin/page-query";
import { crmLabel } from "@/lib/crm-label";

export async function listCrm(
  rawPage: string | undefined,
  filters?: { estado?: string; origen?: string },
) {
  const page = pageQuery(rawPage);
  const estado = crmEstado(filters?.estado);
  const origen = crmOrigen(filters?.origen);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };

  let query = db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id")
    .order("created_at", { ascending: false });
  if (origen) query = query.eq("source", origen);
  if (estado) {
    const matched = await db.from("crm_contact_status").select("contact_id").eq("status", estado);
    if (matched.error) throw new Error(matched.error.message);
    const ids = (matched.data ?? []).map((row) => row.contact_id);
    if (ids.length === 0) return { page: page.page, rows: [] as Record<string, string>[] };
    query = query.in("id", ids);
  }

  const contacts = await query.range(page.from, page.to);
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id);
  const status = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (status.error) throw new Error(status.error.message);
  const byContact = new Map((status.data ?? []).map((row) => [row.contact_id, row.status ?? ""]));
  return {
    page: page.page,
    rows: (contacts.data ?? []).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.email,
      source: row.source,
      status: crmLabel(byContact.get(row.id) ?? ""),
    })),
  };
}
