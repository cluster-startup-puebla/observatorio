import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isLinkAccepted } from "@/lib/crm/link-acceptance";

export async function pendingLinkEmails(db: SupabaseClient) {
  const contacts = await db.from("crm_contacts").select("id, email").eq("source", "enlace");
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id as string);
  const statuses = ids.length
    ? await db.from("crm_contact_status").select("contact_id, status").in("contact_id", ids)
    : { data: [], error: null };
  if (statuses.error) throw new Error(statuses.error.message);
  const statusOf = new Map((statuses.data ?? []).map((row) => [row.contact_id as string, row.status as string]));
  return new Set(
    (contacts.data ?? [])
      .filter((row) => !isLinkAccepted(statusOf.get(row.id as string) ?? null))
      .map((row) => String(row.email).trim().toLowerCase()),
  );
}
