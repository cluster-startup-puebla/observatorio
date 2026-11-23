import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { one } from "@/lib/admin/pases/pass-list-embed";
import { deliverRsvpPass } from "@/lib/mail/deliver-rsvp-pass";

/** After path accept: mail RSVP QR for every confirmed seat of this company owner. */
export async function deliverCompanyRsvpPasses(db: SupabaseClient, companyId: string) {
  const company = await db.from("companies").select("profile_id").eq("id", companyId).maybeSingle();
  if (company.error || !company.data?.profile_id) return;
  const profile = await db
    .from("profiles")
    .select("email")
    .eq("id", company.data.profile_id)
    .maybeSingle();
  if (profile.error || !profile.data?.email) return;
  const mail = String(profile.data.email).trim().toLowerCase();
  const listed = await db
    .from("session_rsvps")
    .select("id, session_id, sessions(title)")
    .eq("email", mail)
    .eq("status", "confirmed");
  if (listed.error || !listed.data?.length) return;
  for (const row of listed.data) {
    const title = one(row.sessions as { title: string | null } | { title: string | null }[] | null)?.title?.trim() || "la sesión";
    await deliverRsvpPass(db, mail, String(row.id), String(row.session_id), title);
  }
}
