import type { EmpresarioProfile } from "@/lib/onboarding/empresario-draft";

type PublicRegistrationRow = {
  full_name: string | null;
  job_title: string | null;
  whatsapp: string | null;
  company_name: string | null;
  market_size: string | null;
  employee_band: string | null;
  municipality: string | null;
  sector_slug: string | null;
  referral_source: string | null;
  session_interest: string | null;
  invite_token: string | null;
};

function text(value: string | null) {
  return value ?? "";
}

export function toEmpresarioProfile(row: PublicRegistrationRow): EmpresarioProfile {
  return {
    fullName: text(row.full_name),
    jobTitle: text(row.job_title),
    whatsapp: text(row.whatsapp),
    companyName: text(row.company_name),
    marketSize: text(row.market_size),
    employeeBand: text(row.employee_band),
    municipality: text(row.municipality),
    sectorSlug: text(row.sector_slug),
    referralSource: text(row.referral_source),
    sessionInterest: text(row.session_interest),
  };
}

function firstRow(data: unknown) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  return row as PublicRegistrationRow;
}

async function attributeInvite(token: string | null, email: string, profile: EmpresarioProfile) {
  if (!token) return;
  try {
    const { attributeSignup } = await import("@/lib/organismo/attribute-signup");
    await attributeSignup({
      token,
      email,
      sectorSlug: profile.sectorSlug,
      nombre: profile.fullName,
      empresa: profile.companyName,
    });
  } catch {
    // The profile is already saved; poured_at is still marked.
  }
}

export async function pourRegistration(accessToken: string, profileId: string, email: string) {
  if (!accessToken || !profileId) return false;
  try {
    const { createSupabaseWithAccess } = await import("@/lib/supabase/auth-session");
    const { saveEmpresarioProfile } = await import("@/lib/onboarding/save-empresario");
    const db = createSupabaseWithAccess(accessToken);
    const taken = await db.rpc("take_public_registration");
    if (taken.error) return false;
    const row = firstRow(taken.data);
    if (!row) return false;
    const profile = toEmpresarioProfile(row);
    const saved = await saveEmpresarioProfile(
      accessToken,
      profileId,
      profile,
      Boolean(row.invite_token),
      false,
    );
    if (!saved.ok) return false;
    await attributeInvite(row.invite_token, email, profile);
    try {
      await db.rpc("mark_public_registration_poured", { profile_id: profileId });
    } catch {
      return true;
    }
    return true;
  } catch {
    return false;
  }
}
