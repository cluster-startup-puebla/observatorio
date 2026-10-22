import "server-only";

import { getDirectory } from "@/lib/memory-directory";
import { isUuid, openRef } from "@/lib/ref-token";
import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export type InviteBrand = { name: string; logoPath: string | null };

function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

export async function loadInviteBrand(token: string): Promise<InviteBrand | null> {
  const orgId = openRef(token, refSecret());
  if (!orgId) return null;
  if (!usesSupabaseAuth()) {
    const brand = await getDirectory().brandForToken(token);
    return brand ? { name: brand.name, logoPath: null } : null;
  }

  if (!isUuid(orgId)) return null;
  const result = await createSupabaseAnon().rpc("organization_invite_brand", { org_id: orgId });
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (result.error || !row?.name) {
    if (result.error) console.error("[organismo] marca pública", result.error.message);
    return null;
  }
  return { name: row.name, logoPath: row.logo_path ?? null };
}

export async function inviteBrand(token: string) {
  const brand = await loadInviteBrand(token);
  if (!brand) return null;
  return {
    name: brand.name,
    logoSrc: brand.logoPath ? `/api/invitacion/logo?t=${encodeURIComponent(token)}` : null,
  };
}
