import "server-only";

import { companyHasLogo } from "@/lib/onboarding/company-has-logo";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { profileGaps } from "./profile-gaps";

export async function loadProfileGaps(accessToken: string, profileId: string) {
  const company = await createSupabaseWithAccess(accessToken)
    .from("companies")
    .select("website")
    .eq("profile_id", profileId)
    .maybeSingle();
  const hasLogo = await companyHasLogo(accessToken, profileId);
  const website = typeof company.data?.website === "string" ? company.data.website : "";
  const { gaps, counter } = profileGaps({ hasLogo, website });
  return { hasLogo, website, gaps, counter };
}
