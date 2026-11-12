import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { cuentaDisplayName, cuentaMarkSrc, orgHasLogo } from "./cuenta-row";

export async function listCuentas(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[], orgs: [] as { id: string; name: string }[], total: 0 };
  const profiles = await db
    .from("profiles")
    .select("id, full_name, email, role, onboarded_at, job_title, whatsapp, organization_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (profiles.error) throw new Error(profiles.error.message);
  const orgs = await db.from("organizations").select("id, name, media_assets(purpose)").order("name");
  if (orgs.error) throw new Error(orgs.error.message);
  const named = new Map((orgs.data ?? []).map((org) => [org.id, org.name ?? ""]));
  const marked = new Map(
    (orgs.data ?? []).map((org) => [
      org.id,
      cuentaMarkSrc(org.id, orgHasLogo(org.media_assets as { purpose: string }[] | null)),
    ]),
  );
  return {
    page: page.page,
    total: profiles.count ?? 0,
    rows: (profiles.data ?? []).map((row) => {
      const orgId = row.organization_id ?? "";
      const fullName = row.full_name ?? "";
      return {
        id: row.id,
        full_name: fullName,
        display_name: cuentaDisplayName(fullName, named.get(orgId) ?? ""),
        email: row.email ?? "",
        role: row.role,
        onboarded_at: row.onboarded_at ? "Terminado" : "Sin terminar",
        job_title: row.job_title ?? "",
        whatsapp: row.whatsapp ?? "",
        organization_id: orgId,
        logo: marked.get(orgId) ?? "",
      };
    }),
    orgs: (orgs.data ?? []).map((org) => ({ id: org.id, name: org.name ?? org.id })),
  };
}
