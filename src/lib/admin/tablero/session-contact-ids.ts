import "server-only";

import type { adminDb } from "@/lib/admin/admin-db";
import { companySessionOrFilter } from "./company-session-filter";

type Db = NonNullable<Awaited<ReturnType<typeof adminDb>>>;

/** Contact ids tied to a session via company.session_id or link_copies. */
export async function sessionContactIds(db: Db, sessionId: string) {
  const session = await db.from("sessions").select("id, is_current").eq("id", sessionId).maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return new Set<string>();

  let companiesQuery = db.from("companies").select("profile_id");
  const orFilter = companySessionOrFilter(session.data);
  companiesQuery = orFilter ? companiesQuery.or(orFilter) : companiesQuery.eq("session_id", sessionId);
  const [companies, links] = await Promise.all([
    companiesQuery,
    db.from("link_copies").select("organization_id").eq("session_id", sessionId),
  ]);
  if (companies.error) throw new Error(companies.error.message);
  if (links.error) throw new Error(links.error.message);

  const profiles = (companies.data ?? []).map((row) => row.profile_id).filter(Boolean);
  const orgs = [...new Set((links.data ?? []).map((row) => row.organization_id).filter(Boolean))];
  const ids = new Set<string>();

  if (profiles.length > 0) {
    const byProfile = await db.from("crm_contacts").select("id").in("profile_id", profiles);
    if (byProfile.error) throw new Error(byProfile.error.message);
    for (const row of byProfile.data ?? []) ids.add(row.id);
  }
  if (orgs.length > 0) {
    const byOrg = await db.from("crm_contacts").select("id").in("organization_id", orgs);
    if (byOrg.error) throw new Error(byOrg.error.message);
    for (const row of byOrg.data ?? []) ids.add(row.id);
  }
  return ids;
}
