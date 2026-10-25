import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { companyOwner } from "@/lib/admin/empresas/company-owner";
import { waitsForExternalApproval } from "./external-approval";
import { pendingLinkEmails } from "./pending-link-emails";
import { visibleEventLogos } from "./event-logos";

export async function loadEventLogos() {
  const db = await adminDb();
  if (!db) return [];
  const companies = await db
    .from("companies")
    .select(`id, legal_name, profile_id, show_logo_on_event, sector_source, admitted_at, owner:${companyOwner}(email)`);
  if (companies.error) throw new Error(companies.error.message);
  const pending = await pendingLinkEmails(db);
  const admitted = (companies.data ?? []).filter(
    (row) => !waitsForExternalApproval(String(row.sector_source ?? ""), row.admitted_at ?? null),
  );
  const visible = admitted.filter((row) => {
    const profile = row.owner as { email?: string } | { email?: string }[] | null;
    const info = Array.isArray(profile) ? profile[0] : profile;
    const email = String(info?.email ?? "").trim().toLowerCase();
    return !pending.has(email);
  });
  const ids = visible.map((row) => row.profile_id as string);
  const assets = ids.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", ids)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  return visibleEventLogos(
    visible.map((row) => ({
      id: row.id as string,
      legalName: row.legal_name as string,
      profileId: row.profile_id as string,
      show: Boolean(row.show_logo_on_event),
    })),
    (assets.data ?? []).map((row) => ({ profileId: row.profile_id as string })),
  );
}
