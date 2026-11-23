import "server-only";

import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { isCompanyVerified } from "./company-verified";

export async function readCompanyVerified(): Promise<boolean> {
  if (!usesSupabaseAuth()) return true;
  const token = await readAccessToken();
  if (!token) return false;
  const user = await createSupabaseWithAccess(token).auth.getUser();
  const profileId = user.data.user?.id;
  if (user.error || !profileId) return false;
  const company = await createSupabaseWithAccess(token)
    .from("companies")
    .select("admitted_at")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (company.error || !company.data) return false;
  return isCompanyVerified(company.data.admitted_at);
}