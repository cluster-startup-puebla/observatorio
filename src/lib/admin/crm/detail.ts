import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { crmLabel } from "@/lib/crm-label";

export async function loadCrm(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const contact = await db
    .from("crm_contacts")
    .select("id, nombre, empresa, email, source, organization_id, sector_id, profile_id")
    .eq("id", id)
    .maybeSingle();
  if (contact.error) throw new Error(contact.error.message);
  if (!contact.data) return null;
  const [events, status] = await Promise.all([
    db.from("crm_events").select("id, event, occurred_at, actor_id").eq("contact_id", id).order("occurred_at", { ascending: false }),
    db.from("crm_contact_status").select("status").eq("contact_id", id).maybeSingle(),
  ]);
  if (events.error) throw new Error(events.error.message);
  if (status.error) throw new Error(status.error.message);
  return {
    contact: contact.data,
    status: crmLabel(status.data?.status ?? ""),
    statusCode: (status.data?.status ?? null) as string | null,
    events: events.data ?? [],
  };
}
