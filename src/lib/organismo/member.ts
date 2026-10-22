import "server-only";

import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";
import type { OrgOwner } from "./owner";

export async function requireOrgMember(owner: OrgOwner) {
  const account = await readSessionAccount();
  if (!account) redirect(`/login?next=/${owner.slug}`);
  if (usesSupabaseAuth()) {
    const token = await readAccessToken();
    if (!token) redirect(`/login?next=/${owner.slug}`);
    const profile = await createSupabaseWithAccess(token)
      .from("profiles")
      .select("organization_id")
      .eq("id", account.id)
      .maybeSingle();
    if (profile.data?.organization_id !== owner.id) redirect("/organismo");
    return account;
  }
  if (account.id !== owner.id) redirect("/organismo");
  return account;
}
