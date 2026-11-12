import { bandLabel } from "./band-label";
import { companyLogoSrc } from "./company-logo-src";
import { ownerEmail } from "./convener";
import { externalApprovalLabel } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";

type Sector = { name?: string | null; slug?: string | null } | { name?: string | null; slug?: string | null }[] | null;
type Owner = { email?: string | null } | { email?: string | null }[] | null;

export type EmpresaSource = {
  id: string;
  legal_name: string;
  employee_band: string;
  sector_id: string;
  sector_source: string | null;
  admitted_at: string | null;
  referral_source: string | null;
  profile_id: string;
  sectors: Sector;
  owner: Owner;
};

export function toEmpresaRow(
  row: EmpresaSource,
  withLogo: Set<string>,
  links: { hrefs: Map<string, string>; statuses: Map<string, string[]> },
) {
  const name = Array.isArray(row.sectors) ? row.sectors[0]?.name : row.sectors?.name;
  const email = ownerEmail(row.owner);
  return {
    id: row.id,
    logo: companyLogoSrc(row.id, withLogo.has(row.profile_id)),
    legal_name: row.legal_name,
    employee_band: bandLabel(row.employee_band),
    band: row.employee_band,
    sector_name: name ?? "",
    sector_id: row.sector_id,
    referral_source: row.referral_source ?? "",
    sector_source: row.sector_source ?? "",
    convoco: links.hrefs.get(email) ?? "—",
    llegada: sectorSourceLabel(row.sector_source ?? ""),
    aprobacion: externalApprovalLabel(row.sector_source ?? "", row.admitted_at, links.statuses.get(email) ?? []),
  };
}
