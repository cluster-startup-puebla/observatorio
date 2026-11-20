import "server-only";

import { companyHasLogo } from "@/lib/onboarding/company-has-logo";
import { createSupabaseAnon, createSupabaseWithAccess, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { profileGaps } from "./profile-gaps";

async function emailConfirmed(accessToken: string) {
  if (!usesSupabaseAuth()) return true;
  const user = await createSupabaseAnon().auth.getUser(accessToken);
  if (user.error || !user.data.user) return true;
  return Boolean(user.data.user.email_confirmed_at);
}

export async function loadProfileGaps(accessToken: string, profileId: string) {
  const company = await createSupabaseWithAccess(accessToken)
    .from("companies")
    .select("website")
    .eq("profile_id", profileId)
    .maybeSingle();
  const [hasLogo, confirmed] = await Promise.all([
    companyHasLogo(accessToken, profileId),
    emailConfirmed(accessToken),
  ]);
  const website = typeof company.data?.website === "string" ? company.data.website : "";
  const { gaps, counter } = profileGaps({ hasLogo, website, emailConfirmed: confirmed });
  return { hasLogo, website, gaps, counter };
}
