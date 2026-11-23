import type { SupabaseClient } from "@supabase/supabase-js";

/** Legacy `passes` row or confirmed RSVP with `rsvp_passes`. */
export async function profileHasPass(db: SupabaseClient, profileId: string) {
  const [legacy, seat] = await Promise.all([
    db.from("passes").select("profile_id").eq("profile_id", profileId).maybeSingle(),
    db
      .from("session_rsvps")
      .select("id, rsvp_passes!inner(rsvp_id)")
      .eq("profile_id", profileId)
      .eq("status", "confirmed")
      .limit(1)
      .maybeSingle(),
  ]);
  if (legacy.error) throw new Error(legacy.error.message);
  if (seat.error) throw new Error(seat.error.message);
  return Boolean(legacy.data) || Boolean(seat.data);
}
