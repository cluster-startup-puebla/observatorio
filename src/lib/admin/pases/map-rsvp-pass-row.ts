import { passListRow, type PassListRow } from "@/lib/admin/pases/pass-list-row";
import { one, type CompanyFace, type RsvpEmbed } from "@/lib/admin/pases/pass-list-embed";

export function mapRsvpPassRow(
  row: { rsvp_id: string; issued_at: string; sessions: unknown; session_rsvps: unknown },
  arrived: Map<string, string>,
  companyByProfile: Map<string, CompanyFace>,
): PassListRow | null {
  const seat = one(row.session_rsvps as RsvpEmbed | RsvpEmbed[] | null);
  if (!seat) return null;
  const profile = one(seat.profiles);
  const company = one(seat.companies);
  const sector = one(company?.sectors) ?? one(seat.sectors);
  const profileId = seat.profile_id ?? "";
  const fromCompany = profileId ? companyByProfile.get(profileId) : null;
  return passListRow({
    id: profileId || String(row.rsvp_id),
    name: profile?.full_name?.trim() || seat.full_name?.trim() || profile?.email || seat.email || String(row.rsvp_id),
    email: profile?.email || seat.email || "",
    company: company?.legal_name || fromCompany?.name || seat.company_name || "",
    sector: sector?.name || fromCompany?.sector || "",
    sectorId: company?.sector_id || seat.sector_id || fromCompany?.sectorId || "",
    session: one(row.sessions as { title: string | null } | { title: string | null }[] | null)?.title || "—",
    profileId,
    issuedAt: row.issued_at,
    arrivedAt: profileId ? arrived.get(profileId) || "" : "",
    kind: "rsvp",
  });
}
