import type { Seat } from "./sector-fill";

type SectorEmbed = { name?: string | null; slug?: string | null };

export const rsvpFillColumns =
  "status, profile_id, sector_slug, sectors:sector_id(name, slug)";

function one<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function toRsvpSeat(row: {
  status?: string | null;
  sector_slug?: string | null;
  sectors?: SectorEmbed | SectorEmbed[] | null;
}): Seat | null {
  const status = String(row.status ?? "").toLowerCase();
  if (status === "cancelled" || (status !== "confirmed" && status !== "pending")) return null;
  const sector = one(row.sectors);
  const slug = (sector?.slug ?? row.sector_slug ?? "").trim();
  const name = (sector?.name ?? row.sector_slug ?? slug).trim();
  return {
    sectorSlug: slug,
    sectorName: name || slug,
    status,
    released: false,
  };
}