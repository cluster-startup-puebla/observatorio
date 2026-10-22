import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadSector(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const sector = await db.from("sectors").select("id, slug, name, position").eq("id", id).maybeSingle();
  if (sector.error) throw new Error(sector.error.message);
  if (!sector.data) return null;
  const page = await db.from("sector_pages").select("headline, body").eq("sector_id", id).maybeSingle();
  if (page.error) throw new Error(page.error.message);
  return { sector: sector.data, page: page.data };
}
