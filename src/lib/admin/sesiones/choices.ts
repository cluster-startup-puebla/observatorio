import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function sessionSectorChoices() {
  const db = await adminDb();
  if (!db) return [] as { id: string; name: string; slug: string }[];
  const result = await db.from("sectors").select("id, name, slug").order("position");
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
  }));
}
