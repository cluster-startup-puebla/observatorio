import { passListRow, type PassListRow } from "@/lib/admin/pases/pass-list-row";
import { one, type CompanyFace } from "@/lib/admin/pases/pass-list-embed";

export function mapLegacyPassRow(
  row: { profile_id: string; issued_at: string; profiles: unknown },
  arrived: Map<string, string>,
  companyByProfile: Map<string, CompanyFace>,
): PassListRow {
  const profile = one(
    row.profiles as { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null,
  );
  const company = companyByProfile.get(row.profile_id);
  return passListRow({
    id: row.profile_id,
    name: profile?.full_name?.trim() || profile?.email || row.profile_id,
    email: profile?.email || "",
    company: company?.name || "",
    sector: company?.sector || "",
    sectorId: company?.sectorId || "",
    session: "—",
    profileId: row.profile_id,
    issuedAt: row.issued_at,
    arrivedAt: arrived.get(row.profile_id) || "",
    kind: "legacy",
  });
}
