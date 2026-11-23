import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { mapRegistroRows, type RegistroRow } from "./map-rows";

export async function listRegistros(rawPage: string | undefined, sessionId?: string | null) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as RegistroRow[], total: 0 };
  let query = db
    .from("public_registrations")
    .select(
      "id, full_name, company_name, email, sector_slug, referral_source, completed_at, poured_at, poured_profile_id, session_id, sessions(title, session_on, public_slug)",
      { count: "exact" },
    )
    .order("poured_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });
  if (sessionId) query = query.eq("session_id", sessionId);
  const result = await query.range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  const profiles = (result.data ?? []).flatMap((row) => (row.poured_profile_id ? [row.poured_profile_id] : []));
  const companies = await companyByProfile(db, profiles);
  return {
    page: page.page,
    total: result.count ?? 0,
    rows: mapRegistroRows(result.data ?? [], companies),
  };
}

async function companyByProfile(db: NonNullable<Awaited<ReturnType<typeof adminDb>>>, profileIds: string[]) {
  const companies = new Map<string, string>();
  if (profileIds.length === 0) return companies;
  const found = await db.from("companies").select("id, profile_id").in("profile_id", profileIds);
  if (found.error) throw new Error(found.error.message);
  for (const row of found.data ?? []) companies.set(row.profile_id, row.id);
  return companies;
}
