import { companyOwner } from "@/lib/admin/empresas/company-owner";
import { waitsForExternalApproval } from "@/lib/admin/empresas/external-approval";
import type { Seat, SectorQuota } from "./sector-fill";

type SectorEmbed = { name?: string | null; slug?: string | null };
type ProfileEmbed = { role?: string | null; email?: string | null };

export const companySeatColumns = `id, sector_source, admitted_at, sectors(name, slug), owner:${companyOwner}!inner(onboarded_at, role, email)`;

function one<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function toSeat(
  row: {
    id?: string | null;
    sector_source?: string | null;
    admitted_at?: string | null;
    sectors?: SectorEmbed | SectorEmbed[] | null;
    owner?: ProfileEmbed | ProfileEmbed[] | null;
  },
  pending: Set<string>,
  released: Set<string>,
): Seat {
  const sector = one(row.sectors);
  const profile = one(row.owner);
  const email = String(profile?.email ?? "").trim().toLowerCase();
  const id = String(row.id ?? "");
  return {
    sectorSlug: sector?.slug ?? "",
    sectorName: sector?.name ?? "",
    onboarded: true,
    role: profile?.role ?? "",
    linkPending: pending.has(email),
    externalPending: waitsForExternalApproval(String(row.sector_source ?? ""), row.admitted_at ?? null),
    released: released.has(id),
  };
}

export function toQuota(row: { capacity?: number | null; sectors?: SectorEmbed | SectorEmbed[] | null }): SectorQuota | null {
  const sector = one(row.sectors);
  if (!sector?.slug) return null;
  return { sectorSlug: sector.slug, sectorName: sector.name ?? "", capacity: Number(row.capacity ?? 0) };
}
