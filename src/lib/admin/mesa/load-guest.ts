import type { SupabaseClient } from "@supabase/supabase-js";
import { mesaGuest, type MesaGuest } from "@/lib/admin/mesa/guest";
import { one } from "@/lib/admin/pases/pass-list-embed";

type CompanyEmbed = {
  legal_name: string | null;
  referral_source: string | null;
  sectors: { name: string | null } | { name: string | null }[] | null;
};

/** Prefer account/company card; fall back to RSVP row when needed. */
export async function loadMesaGuest(
  db: SupabaseClient,
  profileId: string | null,
  rsvpId?: string | null,
): Promise<MesaGuest> {
  if (profileId) {
    const listed = await db
      .from("profiles")
      .select("full_name, companies(legal_name, referral_source, sectors(name))")
      .eq("id", profileId)
      .maybeSingle();
    if (listed.error) throw new Error(listed.error.message);
    if (listed.data) {
      const company = one(listed.data.companies as CompanyEmbed | CompanyEmbed[] | null);
      const guest = mesaGuest({
        full_name: listed.data.full_name,
        company_name: company?.legal_name,
        sector_name: one(company?.sectors)?.name,
        invited_by: company?.referral_source,
      });
      if (guest.name || guest.company) return guest;
    }
  }
  if (!rsvpId) return mesaGuest(null);
  const seat = await db
    .from("session_rsvps")
    .select("full_name, email, company_name, sector_slug, sectors(name)")
    .eq("id", rsvpId)
    .maybeSingle();
  if (seat.error) throw new Error(seat.error.message);
  return mesaGuest({
    full_name: seat.data?.full_name || seat.data?.email,
    company_name: seat.data?.company_name,
    sector_name: one(seat.data?.sectors as { name: string | null } | { name: string | null }[] | null)?.name
      || seat.data?.sector_slug,
  });
}
