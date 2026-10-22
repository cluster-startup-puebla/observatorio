export type SectorCut = {
  slug: string;
  name: string;
  opens: number;
  conversions: number;
  rate: number;
};

export function sectorCuts(
  opens: { sectorSlug: string }[],
  names: Map<string, string>,
  registrations: Map<string, number>,
): SectorCut[] {
  const counts = new Map<string, number>();
  for (const open of opens) {
    if (!open.sectorSlug) continue;
    counts.set(open.sectorSlug, (counts.get(open.sectorSlug) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => {
      const converted = registrations.get(slug) ?? 0;
      return {
        slug,
        name: names.get(slug) ?? slug,
        opens: count,
        conversions: converted,
        rate: count === 0 ? 0 : Math.round((converted / count) * 100),
      };
    })
    .sort((a, b) => b.opens - a.opens || a.name.localeCompare(b.name, "es"));
}
