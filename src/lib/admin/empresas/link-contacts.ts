import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { convenerByEmail, convenerHrefs, organizationName, statusByEmail } from "./convener";

type Named = { name?: string } | { name?: string }[] | null;

export async function loadLinkContacts(db: SupabaseClient, emails: string[]) {
  const empty = {
    convened: new Map<string, string>(),
    hrefs: new Map<string, string>(),
    statuses: new Map<string, string[]>(),
  };
  if (!emails.length) return empty;
  const contacts = await db
    .from("crm_contacts")
    .select("id, email, organization_id, organizations(name)")
    .eq("source", "enlace")
    .in("email", emails);
  if (contacts.error) throw new Error(contacts.error.message);
  const rows = contacts.data ?? [];
  const statuses = rows.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", rows.map((row) => row.id))
    : { data: [] as { contact_id: string; status: string | null }[], error: null };
  if (statuses.error) throw new Error(statuses.error.message);
  const statusOf = new Map((statuses.data ?? []).map((row) => [row.contact_id, row.status]));
  const named = rows.map((contact) => ({
    email: contact.email,
    name: organizationName(contact.organizations as Named),
    id: contact.organization_id,
  }));
  return {
    convened: convenerByEmail(named),
    hrefs: convenerHrefs(named),
    statuses: statusByEmail(rows.map((contact) => ({
      email: contact.email,
      status: statusOf.get(contact.id) ?? null,
    }))),
  };
}
