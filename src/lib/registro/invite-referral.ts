import "server-only";

import { loadInviteBrand } from "@/lib/organismo/invite-brand";

/** Org name from invite token; used as locked “cómo se enteró”. */
export async function inviteReferralSource(token?: string | null) {
  const clean = token?.trim() ?? "";
  if (!clean) return null;
  const brand = await loadInviteBrand(clean);
  const name = brand?.name?.trim() ?? "";
  return name.length >= 2 ? name : null;
}
