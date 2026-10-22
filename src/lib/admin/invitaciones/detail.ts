import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { crmLabel } from "@/lib/crm-label";

export async function loadInvitacion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const contact = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id")
    .eq("id", id)
    .in("source", ["excel", "manual"])
    .maybeSingle();
  if (contact.error) throw new Error(contact.error.message);
  if (!contact.data) return null;
  const status = await db.from("crm_contact_status").select("status").eq("contact_id", id).maybeSingle();
  if (status.error) throw new Error(status.error.message);
  return { contact: contact.data, statusCode: status.data?.status ?? null, status: crmLabel(status.data?.status ?? "") };
}
