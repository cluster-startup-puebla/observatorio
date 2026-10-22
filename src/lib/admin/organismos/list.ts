import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { memoryListOrganismos } from "./memory";

export async function listOrganismos(rawPage: string | undefined) {
  if (!usesSupabaseAuth()) return memoryListOrganismos(rawPage);
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("organizations")
    .select("id, name, brand_color, brand_completed_at, media_assets(object_path, purpose)")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => {
      const assets = row.media_assets as { object_path: string; purpose: string }[] | null;
      const logo = Array.isArray(assets) ? assets.find((asset) => asset.purpose === "organization_logo") : null;
      return {
        id: row.id,
        logo: logo ? `/api/admin/organismos/${row.id}/logo` : "",
        name: row.name ?? "",
        brand_color: row.brand_color ?? "",
        brand_completed_at: row.brand_completed_at ? "Lista" : "Incompleta",
      };
    }),
  };
}
