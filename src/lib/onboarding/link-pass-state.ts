import "server-only";

import { passIsPending } from "@/lib/crm/link-acceptance";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function linkPassPending(accessToken: string, email: string) {
  const db = createSupabaseWithAccess(accessToken);
  const contacts = await db
    .from("crm_contacts")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .eq("source", "enlace");
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id as string);
  if (ids.length === 0) return false;
  const statuses = await db.from("crm_contact_status").select("status").in("contact_id", ids);
  if (statuses.error) throw new Error(statuses.error.message);
  return passIsPending((statuses.data ?? []).map((row) => (row.status as string | null) ?? null));
}
