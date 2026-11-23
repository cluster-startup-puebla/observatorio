/** Open sessions (no sector rows) are visible to every company sector. */
export function sessionVisibleToSector(
  quotas: { sector_id: string }[] | null | undefined,
  sectorId: string,
) {
  const rows = quotas ?? [];
  if (rows.length === 0) return true;
  return rows.some((row) => row.sector_id === sectorId);
}
