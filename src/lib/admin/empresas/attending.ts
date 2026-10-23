import { isLinkAccepted } from "@/lib/crm/link-acceptance";

export type AttendingInput = {
  id: string;
  legalName: string;
  sectorSlug: string;
  sectorName: string;
  showLogo: boolean;
  onboarded: boolean;
  role: string;
  linkStatus: string | null;
};

export function attendingCompanies(rows: AttendingInput[], sector: string | null) {
  const slug = sector?.trim() || null;
  const matched = rows.filter(
    (row) =>
      row.onboarded &&
      row.role === "empresario" &&
      isLinkAccepted(row.linkStatus) &&
      (!slug || row.sectorSlug === slug),
  );
  return {
    sector: slug,
    rows: matched.map((row) => ({
      id: row.id,
      legalName: row.legalName,
      sectorSlug: row.sectorSlug,
      sectorName: row.sectorName,
      showLogo: row.showLogo,
      logoUrl: row.showLogo ? `/api/admin/empresas/${row.id}/logo` : null,
    })),
  };
}
