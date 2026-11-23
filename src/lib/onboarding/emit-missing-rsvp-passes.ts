import "server-only";

import { deliverRsvpPass } from "@/lib/mail/deliver-rsvp-pass";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

type RsvpRow = { id: string; session_id: string; sessions: { title: string | null } | null };

function sessionLabel(row: RsvpRow) {
  return row.sessions?.title?.trim() || "la sesión";
}

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
  for (const row of listed.data as RsvpRow[]) {
    if (sent.has(row.id)) continue;
    await deliverRsvpPass(db, email, row.id, row.session_id, sessionLabel(row));
  }
}