import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadMedio(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const asset = await db
    .from("media_assets")
    .select("id, purpose, bucket_id, object_path, content_type, byte_size, organization_id, profile_id, content_block_slug")
    .eq("id", id)
    .maybeSingle();
  if (asset.error) throw new Error(asset.error.message);
  if (!asset.data) return null;
  if (!["organization_logo", "content_image", "pass_qr", "company_logo"].includes(asset.data.purpose)) return null;
  return asset.data;
}
