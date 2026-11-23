import { companyOwner } from "@/lib/admin/empresas/company-owner";

type SectorEmbed = { name?: string | null; slug?: string | null };

export type CompanySeatPick = { sectorSlug: string; released: boolean };

export const companySeatColumns = `id, legal_name, employee_band, sector_id, sector_source, admitted_at, referral_source, profile_id, sectors(name, slug), owner:${companyOwner}!inner(onboarded_at, role, email)`;

function one<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function toSeat(
  row: {
    id?: string | null;
    sectors?: SectorEmbed | SectorEmbed[] | null;
    owner?: ProfileEmbed | ProfileEmbed[] | null;
  },
  _pending: Set<string>,
  released: Set<string>,
): CompanySeatPick {
  const sector = one(row.sectors);
  const id = String(row.id ?? "");
  return { sectorSlug: sector?.slug ?? "", released: released.has(id) };
}

export function toQuota(row: { capacity?: number | null; sectors?: SectorEmbed | SectorEmbed[] | null }) {
  const sector = one(row.sectors);
  if (!sector?.slug) return null;
  return { sectorSlug: sector.slug, sectorName: sector.name ?? "", capacity: Number(row.capacity ?? 0) };
}