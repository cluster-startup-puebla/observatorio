type SectorInfo = { name?: string; slug?: string; position?: number };

export function mapSessionQuotas(
  rows: { sector_id: string; capacity: number; sectors: SectorInfo | SectorInfo[] | null }[],
) {
  const mapped = rows.map((row) => {
    const info = Array.isArray(row.sectors) ? row.sectors[0] : row.sectors;
    return {
      sectorId: row.sector_id,
      capacity: row.capacity,
      name: info?.name ?? row.sector_id,
      slug: info?.slug ?? "",
      position: info?.position ?? 0,
    };
  });
  mapped.sort((a, b) => a.position - b.position);
  return mapped;
}
