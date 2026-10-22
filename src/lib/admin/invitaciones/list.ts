import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listInvitaciones(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], orgs: [] as { id: string; name: string }[] };
  const contacts = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id")
    .in("source", ["excel", "manual"])
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (contacts.error) throw new Error(contacts.error.message);
  const orgs = await db.from("organizations").select("id, name").order("name");
  if (orgs.error) throw new Error(orgs.error.message);
  return {
    page: page.page,
    rows: (contacts.data ?? []).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.email,
      source: row.source,
    })),
    orgs: (orgs.data ?? []).map((org) => ({ id: org.id, name: org.name ?? org.id })),
  };
}
