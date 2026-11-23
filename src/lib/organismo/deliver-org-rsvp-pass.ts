import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { deliverRsvpPass } from "@/lib/mail/deliver-rsvp-pass";

/** After org accepts enlace: send RSVP QR even without account. */
export async function deliverOrgRsvpPass(db: SupabaseClient, contactId: string) {
  const contact = await db
    .from("crm_contacts")
    .select("email, organization_id")
    .eq("id", contactId)
    .maybeSingle();
  if (contact.error || !contact.data?.email || !contact.data.organization_id) return;
  const mail = String(contact.data.email).toLowerCase();
  const rsvp = await db
    .from("session_rsvps")
    .select("id, session_id, status")
    .eq("email", mail)
    .eq("organization_id", contact.data.organization_id)
    .eq("status", "confirmed")
    .order("confirmed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (rsvp.error || !rsvp.data?.id || !rsvp.data.session_id) return;
  const session = await db.from("sessions").select("title").eq("id", rsvp.data.session_id).maybeSingle();
  const label = session.data?.title?.trim() || "la sesión";
  await deliverRsvpPass(db, mail, String(rsvp.data.id), String(rsvp.data.session_id), label);
}
