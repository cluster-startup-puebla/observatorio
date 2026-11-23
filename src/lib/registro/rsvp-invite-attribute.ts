import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid, openRef } from "@/lib/ref-token";

function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

export async function attributeRsvpInvite(
  supabase: SupabaseClient,
  registrationId: string,
  inviteToken: string,
) {
  const orgId = openRef(inviteToken.trim(), refSecret());
  if (!orgId || !isUuid(orgId)) return;
  const attributed = await supabase.rpc("attribute_rsvp_invite", {
    p_registration_id: registrationId,
    p_org_id: orgId,
  });
  if (attributed.error) console.error("attribute_rsvp_invite", attributed.error.message);
}