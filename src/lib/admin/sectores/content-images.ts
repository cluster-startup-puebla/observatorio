import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function listContentImages() {
  const db = await adminDb();
  if (!db) return [] as { id: string }[];
  const result = await db
    .from("media_assets")
    .select("id")
    .eq("purpose", "content_image")
    .order("created_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map((row) => ({ id: String(row.id) }));
}
