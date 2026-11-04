import "server-only";

import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { inviteOutcome, type InviteOutcome } from "./invite-outcome";

export async function linkInviteOutcome(accessToken: string, email: string): Promise<InviteOutcome> {
  const db = createSupabaseWithAccess(accessToken);
  const contacts = await db
    .from("crm_contacts")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .eq("source", "enlace");
  if (contacts.error) throw new Error(contacts.error.message);
  const ids = (contacts.data ?? []).map((row) => row.id as string);
  if (ids.length === 0) return "pase";
  const statuses = await db.from("crm_contact_status").select("status").in("contact_id", ids);
  if (statuses.error) throw new Error(statuses.error.message);
  return inviteOutcome((statuses.data ?? []).map((row) => (row.status as string | null) ?? null));
}

export async function linkPassPending(accessToken: string, email: string) {
  return (await linkInviteOutcome(accessToken, email)) !== "pase";
}
