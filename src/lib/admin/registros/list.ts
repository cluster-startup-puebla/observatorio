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
    .order("created_at", { ascending: false });
  if (sessionId) query = query.eq("session_id", sessionId);
  const result = await query.range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  const data = result.data ?? [];
  const profiles = data.flatMap((row) => (row.poured_profile_id ? [row.poured_profile_id] : []));
  const [companies, rsvps] = await Promise.all([companyByProfile(db, profiles), rsvpStatusMap(db, data)]);
  return { page: page.page, total: result.count ?? 0, rows: mapRegistroRows(data, companies, rsvps) };
}

async function companyByProfile(db: NonNullable<Awaited<ReturnType<typeof adminDb>>>, profileIds: string[]) {
  const companies = new Map<string, string>();
  if (profileIds.length === 0) return companies;
  const found = await db.from("companies").select("id, profile_id").in("profile_id", profileIds);
  if (found.error) throw new Error(found.error.message);
  for (const row of found.data ?? []) companies.set(row.profile_id, row.id);
  return companies;
}

async function rsvpStatusMap(
  db: NonNullable<Awaited<ReturnType<typeof adminDb>>>,
  rows: { email?: string | null; session_id?: string | null }[],
) {
  const status = new Map<string, string>();
  const emails = [...new Set(rows.map((row) => row.email).filter(Boolean))] as string[];
  if (emails.length === 0) return status;
  const found = await db.from("session_rsvps").select("email, session_id, status").in("email", emails);
  if (found.error) throw new Error(found.error.message);
  for (const row of found.data ?? []) status.set(`${row.session_id}:${row.email}`, row.status);
  return status;
}
