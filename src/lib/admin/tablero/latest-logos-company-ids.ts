import type { SupabaseClient } from "@supabase/supabase-js";

/** Legacy session_id on companies plus company_id on confirmed RSVPs. */
export async function companyIdsForSessionLogos(db: SupabaseClient, sessionId: string) {
  const [bySession, byRsvp] = await Promise.all([
    db.from("companies").select("id").eq("session_id", sessionId),
    db
      .from("session_rsvps")
      .select("company_id")
      .eq("session_id", sessionId)
      .eq("status", "confirmed")
      .not("company_id", "is", null),
  ]);
  if (bySession.error) throw new Error(bySession.error.message);
  if (byRsvp.error) throw new Error(byRsvp.error.message);
  const ids = new Set<string>();
  for (const row of bySession.data ?? []) ids.add(String(row.id));
  for (const row of byRsvp.data ?? []) ids.add(String(row.company_id));
  return [...ids];
}