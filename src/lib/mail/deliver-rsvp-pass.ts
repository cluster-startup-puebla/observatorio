import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendRsvpPass } from "./send-rsvp-pass";

export async function deliverRsvpPass(
  db: SupabaseClient,
  toEmail: string,
  rsvpId: string,
  sessionId: string,
  sessionLabel: string,
) {
  const existing = await db.from("rsvp_passes").select("rsvp_id").eq("rsvp_id", rsvpId).maybeSingle();
  if (existing.data) return { ok: true as const, skipped: true as const };
  const sent = await sendRsvpPass(toEmail, rsvpId, sessionLabel);
  if (!sent.ok) return sent;
  const recorded = await db.rpc("record_rsvp_pass", { p_rsvp_id: rsvpId, p_session_id: sessionId });
  if (recorded.error) console.error("record_rsvp_pass", recorded.error.message);
  return { ok: true as const, skipped: false as const };
}