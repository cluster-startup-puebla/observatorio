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
