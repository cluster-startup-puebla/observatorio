import type { SupabaseClient } from "@supabase/supabase-js";

/** Emails with an RSVP for this org on this session. */
export async function orgCrmSessionEmails(db: SupabaseClient, orgId: string, sessionId: string) {
  const rsvps = await db
    .from("session_rsvps")
    .select("email")
    .eq("organization_id", orgId)
    .eq("session_id", sessionId);
  if (rsvps.error) throw new Error(rsvps.error.message);
  return new Set(
    (rsvps.data ?? []).map((row) => String(row.email ?? "").trim().toLowerCase()).filter(Boolean),
  );
}
