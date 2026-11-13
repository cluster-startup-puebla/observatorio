import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

export async function listRegistros(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], total: 0 };
  const result = await db
    .from("public_registrations")
    .select(
      "id, full_name, company_name, email, sector_slug, referral_source, completed_at, poured_at, poured_profile_id",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  const profiles = (result.data ?? []).flatMap((row) => (row.poured_profile_id ? [row.poured_profile_id] : []));
  const companies = await companyByProfile(db, profiles);
  return {
    page: page.page,
    total: result.count ?? 0,
    rows: (result.data ?? []).map((row) => ({
      id: row.id ?? "",
      full_name: row.full_name ?? "",
      company_name: row.company_name ?? "",
      email: row.email ?? "",
      sector_slug: row.sector_slug ?? "",
      referral_source: row.referral_source ?? "",
      completed_at: row.completed_at ?? "",
      poured_at: row.poured_at ?? "",
      profile_id: row.poured_profile_id ?? "",
      company_id: companies.get(row.poured_profile_id ?? "") ?? "",
    })),
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
