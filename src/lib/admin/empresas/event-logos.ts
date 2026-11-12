export type EventLogo = { companyId: string; name: string; profileId: string };

export function visibleEventLogos(
  companies: { id: string; legalName: string; profileId: string; show: boolean }[],
  assets: { profileId: string }[],
): EventLogo[] {
  const ready = new Set(assets.map((asset) => asset.profileId));
  return companies
    .filter((company) => company.show && ready.has(company.profileId))
    .map((company) => ({ companyId: company.id, name: company.legalName, profileId: company.profileId }));
}

export function latestShowable(
  companies: { id: string; legalName: string; profileId: string; show: boolean; createdAt: string }[],
  assets: { profileId: string }[],
  limit: number,
) {
  const ordered = [...companies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return visibleEventLogos(ordered, assets).slice(0, limit);
}
