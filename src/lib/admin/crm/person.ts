import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { bandLabel } from "@/lib/admin/empresas/band-label";
import { marketSizes } from "@/lib/onboarding/market-sizes";

type ContactRow = {
  nombre: string;
  empresa: string;
  email: string;
  organization_id: string;
  sector_id: string | null;
  profile_id: string | null;
};

export type ContactPerson = {
  profileId: string;
  name: string;
  jobTitle: string;
  whatsapp: string;
  email: string;
  companyName: string;
  companyHref: string;
  organizationName: string;
  organizationHref: string;
  sectorName: string;
  sectorHref: string;
  referral: string;
  interest: string;
  municipality: string;
  market: string;
  employees: string;
};

function marketLabel(value: string | null | undefined) {
  if (!value) return "";
  return marketSizes.find((item) => item.value === value)?.label ?? value;
}

export async function loadContactPerson(db: SupabaseClient, contact: ContactRow): Promise<ContactPerson> {
  const profileQuery = db.from("profiles").select("id, full_name, job_title, whatsapp, email");
  const profile = contact.profile_id
    ? await profileQuery.eq("id", contact.profile_id).maybeSingle()
    : await profileQuery.eq("email", contact.email).maybeSingle();
  const org = await db.from("organizations").select("id, name").eq("id", contact.organization_id).maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  if (org.error) throw new Error(org.error.message);
  const company = profile.data
    ? await db
        .from("companies")
        .select("id, legal_name, employee_band, market_size, municipality, referral_source, session_interest, sector_id")
        .eq("profile_id", profile.data.id)
        .maybeSingle()
    : { data: null, error: null };
  if (company.error) throw new Error(company.error.message);
  const sectorId = company.data?.sector_id ?? contact.sector_id;
  const sector = sectorId
    ? await db.from("sectors").select("id, name").eq("id", sectorId).maybeSingle()
    : { data: null, error: null };
  if (sector.error) throw new Error(sector.error.message);
  return {
    profileId: profile.data?.id ?? "",
    name: profile.data?.full_name?.trim() || contact.nombre,
    jobTitle: profile.data?.job_title ?? "",
    whatsapp: profile.data?.whatsapp ?? "",
    email: contact.email,
    companyName: company.data?.legal_name || contact.empresa,
    companyHref: company.data ? `/admin/empresas/${company.data.id}` : "",
    organizationName: org.data?.name ?? "",
    organizationHref: `/admin/organismos/${contact.organization_id}`,
    sectorName: sector.data?.name ?? "",
    sectorHref: sector.data ? `/admin/sectores/${sector.data.id}` : "",
    referral: company.data?.referral_source ?? "",
    interest: company.data?.session_interest ?? "",
    municipality: company.data?.municipality ?? "",
    market: marketLabel(company.data?.market_size),
    employees: bandLabel(company.data?.employee_band ?? ""),
  };
}
