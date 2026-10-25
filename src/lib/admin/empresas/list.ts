import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { bandLabel } from "./band-label";
import { externalApprovalLabel } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";

export async function listEmpresas(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("companies")
    .select("id, legal_name, employee_band, sector_id, sector_source, admitted_at, referral_source, sectors(name)")
    .order("legal_name")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => {
      const sector = row.sectors as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(sector) ? sector[0]?.name : sector?.name;
      return {
        id: row.id,
        legal_name: row.legal_name,
        employee_band: bandLabel(row.employee_band),
        band: row.employee_band,
        sector_name: name ?? "",
        sector_id: row.sector_id,
        referral_source: row.referral_source ?? "",
        sector_source: row.sector_source ?? "",
        llegada: sectorSourceLabel(row.sector_source ?? ""),
        aprobacion: externalApprovalLabel(row.sector_source ?? "", row.admitted_at),
      };
    }),
  };
}
