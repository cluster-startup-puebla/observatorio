import type { BuiltLink, OrganismoLink } from "@/lib/admin/organismos/link-rows";

export function foldLinks(rows: BuiltLink[]): OrganismoLink[] {
  const groups = new Map<string, OrganismoLink>();
  for (const row of rows) {
    const key = row.path || row.id;
    const current = groups.get(key);
    if (!current) {
      groups.set(key, {
        id: row.id,
        sectorId: row.sectorId,
        sector: row.sector,
        session: row.session,
        path: row.path,
        times: 1,
        dates: [row.created],
      });
      continue;
    }
    current.times += 1;
    current.dates.push(row.created);
  }
  return [...groups.values()];
}
