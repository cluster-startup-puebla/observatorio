import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { companyHasLogo } from "@/lib/onboarding/company-has-logo";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { awardLavas } from "./award";
import { LAVA_CODES } from "./codes";

export async function maybeAwardProfileComplete(
  db: SupabaseClient,
  input: { companyId: string; hasLogo: boolean; website: string | null | undefined },
) {
  const site = (input.website ?? "").trim();
  if (!input.hasLogo || !site) return { skipped: "incomplete" as const };
  return awardLavas(db, {
    companyId: input.companyId,
    actionCode: LAVA_CODES.perfilCompleto,
    refKey: "perfil",
    origen: "live",
  });
}

export async function awardProfileGapsIfComplete(accessToken: string, profileId: string) {
  const db = createSupabaseWithAccess(accessToken);
  const company = await db
    .from("companies")
    .select("id, website")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!company.data?.id) return;
  const hasLogo = await companyHasLogo(accessToken, profileId);
  const result = await maybeAwardProfileComplete(db, {
    companyId: company.data.id,
    hasLogo,
    website: company.data.website,
  });
  if ("ok" in result && !result.ok) console.error("lavas perfil", result.reason);
}
