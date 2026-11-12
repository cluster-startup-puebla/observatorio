import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { companyOwner } from "@/lib/admin/empresas/company-owner";
import { pathPendingRows, type PathCompany } from "./path-pending";

export async function loadPathPending() {
  const db = await adminDb();
  if (!db) return [];
  const rows = await db
    .from("companies")
    .select(`id, legal_name, admitted_at, sectors(name), owner:${companyOwner}!inner(full_name, onboarded_at, role)`)
    .eq("sector_source", "path")
    .is("admitted_at", null)
    .order("created_at", { ascending: false });
  if (rows.error) throw new Error(rows.error.message);
  return pathPendingRows((rows.data ?? []) as PathCompany[]);
}
