import "server-only";

import { one } from "@/lib/admin/pases/pass-list-embed";
import { deliverRsvpPass } from "@/lib/mail/deliver-rsvp-pass";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function emitMissingRsvpPasses(accessToken: string, profileId: string, email: string) {
  const db = createSupabaseWithAccess(accessToken);
  const listed = await db
    .from("session_rsvps")
    .select("id, session_id, sessions(title)")
    .eq("profile_id", profileId)
    .eq("status", "confirmed");
  if (listed.error || !listed.data?.length) return;
  const issued = await db.from("rsvp_passes").select("rsvp_id").in(
    "rsvp_id",
    listed.data.map((row) => row.id),
  );
  const sent = new Set((issued.data ?? []).map((row) => row.rsvp_id));
  for (const row of listed.data) {
    if (sent.has(row.id)) continue;
    const title = one(row.sessions as { title: string | null } | { title: string | null }[] | null)?.title?.trim() || "la sesión";
    await deliverRsvpPass(db, email, row.id, row.session_id, title);
  }
}
