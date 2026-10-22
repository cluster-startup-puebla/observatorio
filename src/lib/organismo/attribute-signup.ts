import "server-only";

import { getDirectory } from "@/lib/memory-directory";
import { isUuid, openRef } from "@/lib/ref-token";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";

function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

export async function attributeSignup(input: {
  token: string;
  email: string;
  sectorSlug?: string;
  nombre?: string;
  empresa?: string;
}) {
  if (!usesSupabaseAuth()) {
    await getDirectory().attributeRegistration(input);
    return;
  }
  const orgId = openRef(input.token, refSecret());
  const email = input.email.trim().toLowerCase();
  if (!orgId || !isUuid(orgId) || !input.sectorSlug || !email) return;
  const access = await readAccessToken();
  if (!access) return;
  const saved = await createSupabaseWithAccess(access).rpc("attribute_link_signup", {
    org_id: orgId,
    sector_slug: input.sectorSlug,
    guest_email: email,
    guest_name: input.nombre ?? "",
    guest_company: input.empresa ?? "",
  });
  if (saved.error) throw new Error(saved.error.message);
}
