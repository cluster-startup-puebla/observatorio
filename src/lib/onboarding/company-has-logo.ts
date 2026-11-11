import "server-only";

import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

export async function companyHasLogo(accessToken: string, profileId: string) {
  const row = await createSupabaseWithAccess(accessToken)
    .from("media_assets")
    .select("id")
    .eq("profile_id", profileId)
    .eq("purpose", "company_logo")
    .maybeSingle();
  return Boolean(row.data);
}
