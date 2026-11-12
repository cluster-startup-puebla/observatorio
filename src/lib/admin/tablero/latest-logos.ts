import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { companyOwner } from "@/lib/admin/empresas/company-owner";
import { showableLogos } from "@/lib/admin/empresas/event-logos";
import { waitsForExternalApproval } from "@/lib/admin/empresas/external-approval";
import { pendingLinkEmails } from "@/lib/admin/empresas/pending-link-emails";

export async function loadLatestLogos() {
  const db = await adminDb();
  if (!db) return [];
  const companies = await db
    .from("companies")
    .select(`id, legal_name, profile_id, show_logo_on_event, sector_source, admitted_at, created_at, owner:${companyOwner}(email)`)
    .eq("show_logo_on_event", true)
    .order("created_at", { ascending: false });
  if (companies.error) throw new Error(companies.error.message);
  const pending = await pendingLinkEmails(db);
  const listed = companies.data ?? [];
  const ids = listed.map((row) => row.profile_id as string);
  const assets = ids.length
    ? await db.from("media_assets").select("profile_id").eq("purpose", "company_logo").in("profile_id", ids)
    : { data: [], error: null };
  if (assets.error) throw new Error(assets.error.message);
  return showableLogos(
    listed.map((row) => {
      const profile = row.owner as { email?: string } | { email?: string }[] | null;
      const info = Array.isArray(profile) ? profile[0] : profile;
      const email = String(info?.email ?? "").trim().toLowerCase();
      const waiting = waitsForExternalApproval(String(row.sector_source ?? ""), row.admitted_at ?? null) || pending.has(email);
      return {
        id: row.id as string,
        legalName: row.legal_name as string,
        profileId: row.profile_id as string,
        show: Boolean(row.show_logo_on_event),
        createdAt: String(row.created_at),
        pending: waiting,
      };
    }),
    (assets.data ?? []).map((row) => ({ profileId: row.profile_id as string })),
  );
}
