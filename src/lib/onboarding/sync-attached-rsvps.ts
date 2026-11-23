import "server-only";

import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { emitMissingRsvpPasses } from "./emit-missing-rsvp-passes";

/** Liga RSVPs del correo, CRM enlace si aplica, y emite pases viejos una sola vez. */
export async function syncAttachedRsvps(accessToken: string, profileId: string, email: string) {
  const db = createSupabaseWithAccess(accessToken);
  await db.rpc("attach_rsvps_for_email");
  const crm = await db.rpc("ensure_enlace_contacts_from_rsvps");
  if (crm.error) console.error("ensure_enlace_contacts_from_rsvps", crm.error.message);
  try {
    await emitMissingRsvpPasses(accessToken, profileId, email);
  } catch (error) {
    console.error("emitMissingRsvpPasses", error);
  }
}