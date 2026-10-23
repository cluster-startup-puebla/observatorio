import "server-only";

import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import type { EmpresarioProfile } from "./empresario-draft";

const bands: Record<string, "1_10" | "11_50" | "51_250" | "250_plus"> = {
  "1–10": "1_10",
  "11–50": "11_50",
  "51–250": "51_250",
  "250+": "250_plus",
};

export async function saveEmpresarioProfile(
  accessToken: string,
  profileId: string,
  profile: EmpresarioProfile,
  fromLink: boolean,
  showLogo: boolean,
) {
  const band = bands[profile.employeeBand];
  if (!band) return { ok: false as const, reason: "empleados" };
  const db = createSupabaseWithAccess(accessToken);
  const sector = await db.from("sectors").select("id").eq("slug", profile.sectorSlug).maybeSingle();
  if (sector.error || !sector.data) return { ok: false as const, reason: "sector" };
  const person = await db
    .from("profiles")
    .update({
      full_name: profile.fullName,
      job_title: profile.jobTitle,
      whatsapp: profile.whatsapp || null,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .select("id")
    .maybeSingle();
  if (person.error || !person.data) return { ok: false as const, reason: "perfil" };
  const company = await db
    .from("companies")
    .upsert(
      {
        profile_id: profileId,
        legal_name: profile.companyName,
        sector_id: sector.data.id,
        sector_source: fromLink ? "link" : "path",
        employee_band: band,
        referral_source: profile.referralSource,
        market_size: profile.marketSize,
        municipality: profile.municipality,
        session_interest: profile.sessionInterest,
        show_logo_on_event: showLogo,
      },
      { onConflict: "profile_id" },
    )
    .select("id")
    .maybeSingle();
  if (company.error || !company.data) return { ok: false as const, reason: "empresa" };
  return { ok: true as const };
}
