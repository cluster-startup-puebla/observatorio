import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ownerEmail } from "@/lib/admin/empresas/convener";
import { toEmpresaRow, type EmpresaSource } from "@/lib/admin/empresas/empresa-row";
import { loadLinkContacts } from "@/lib/admin/empresas/link-contacts";
import { toSeat } from "./cupo-seat";

export async function omittedCompanyRows(
  db: SupabaseClient,
  companies: EmpresaSource[],
  slugs: Set<string>,
  pending: Set<string>,
  released: Set<string>,
) {
  const kept = companies.filter((row) => {
    const seat = toSeat(row, pending, released);
    return slugs.has(seat.sectorSlug) && !seat.released;
  });
  const profileIds = kept.map((row) => row.profile_id);
  const emails = kept.map((row) => ownerEmail(row.owner)).filter(Boolean);
  const assets = profileIds.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", profileIds)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  const links = await loadLinkContacts(db, emails);
  const withLogo = new Set((assets.data ?? []).map((asset) => asset.profile_id as string));
  return kept
    .map((row) => toEmpresaRow(row, withLogo, links))
    .sort((a, b) => a.legal_name.localeCompare(b.legal_name, "es"));
}
