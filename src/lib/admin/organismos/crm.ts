import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { crmLabel, crmSourceLabel } from "@/lib/crm-label";

export async function listOrganismoCrm(orgId: string, rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const contacts = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source", { count: "exact" })
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id);
  const status = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (status.error) throw new Error(status.error.message);
  const byContact = new Map((status.data ?? []).map((row) => [row.contact_id, row.status ?? ""]));
  return {
    page: page.page,
    total: contacts.count ?? 0,
    rows: (contacts.data ?? []).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.email,
      source: crmSourceLabel(row.source),
      status: crmLabel(byContact.get(row.id) ?? "") || "—",
    })),
  };
}
