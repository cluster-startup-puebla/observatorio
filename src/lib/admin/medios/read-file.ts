import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { isUuid } from "@/lib/ref-token";

export async function readAdminMediaFile(id: string) {
  if (!isUuid(id)) return null;
  const db = await adminDb();
  if (!db) return null;
  const asset = await db
    .from("media_assets")
    .select("bucket_id, object_path, content_type")
    .eq("id", id)
    .maybeSingle();
  if (asset.error || !asset.data?.object_path || !asset.data.bucket_id) return null;
  const file = await db.storage.from(asset.data.bucket_id).download(asset.data.object_path);
  if (file.error || !file.data) return null;
  return {
    bytes: file.data,
    contentType: asset.data.content_type || file.data.type || "application/octet-stream",
  };
}
