import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { bandLabel } from "./band-label";
import { companyLogoSrc } from "./company-logo-src";
import { companyOwner } from "./company-owner";
import { ownerEmail } from "./convener";
import { externalApprovalLabel } from "./external-approval";
import { loadLinkContacts } from "./link-contacts";
import { sectorSourceLabel } from "./sector-source";

export async function listEmpresas(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const result = await db
    .from("companies")
    .select(
      `id, legal_name, employee_band, sector_id, sector_source, admitted_at, referral_source, profile_id, sectors(name), owner:${companyOwner}(email)`,
      { count: "exact" },
    )
    .order("legal_name")
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  const data = result.data ?? [];
  const profileIds = data.map((row) => row.profile_id);
  const emails = data
    .map((row) => ownerEmail(row.owner as { email?: string } | { email?: string }[] | null))
    .filter(Boolean);
  const assets = profileIds.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", profileIds)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  const links = await loadLinkContacts(db, emails);
  const withLogo = new Set((assets.data ?? []).map((asset) => asset.profile_id));
  return {
    page: page.page,
    total: result.count ?? 0,
    rows: data.map((row) => {
      const sector = row.sectors as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(sector) ? sector[0]?.name : sector?.name;
      const email = ownerEmail(row.owner as { email?: string } | { email?: string }[] | null);
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
        aprobacion: externalApprovalLabel(row.sector_source ?? "", row.admitted_at),
      };
    }),
  };
}
