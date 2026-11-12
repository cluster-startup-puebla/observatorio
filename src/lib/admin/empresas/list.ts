import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { companyOwner } from "./company-owner";
import { ownerEmail } from "./convener";
import { toEmpresaRow, type EmpresaSource } from "./empresa-row";
import { loadLinkContacts } from "./link-contacts";

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
    rows: data.map((row) => toEmpresaRow(row as EmpresaSource, withLogo, links)),
  };
}
