import "server-only";

import { isPublicMediaPurpose } from "@/lib/admin/medios/public-access";
import { isUuid } from "@/lib/ref-token";
import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export type ContentImageFile = {
  purpose: string;
  bucketId: string;
  objectPath: string;
  contentType: string;
};

type RpcRow = {
  purpose: string;
  bucket_id: string;
  object_path: string;
  content_type: string;
};

export async function findContentImage(id: string): Promise<ContentImageFile | null> {
  if (!usesSupabaseAuth() || !isUuid(id)) return null;
  const result = await createSupabaseAnon().rpc("content_image_file", { asset_id: id });
  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as RpcRow | null;
  if (result.error || !row) {
    if (result.error) console.error("medios público", result.error.message);
    return null;
  }
  if (!isPublicMediaPurpose(row.purpose) || row.bucket_id !== "content-images") return null;
  return {
    purpose: row.purpose,
    bucketId: row.bucket_id,
    objectPath: row.object_path,
    contentType: row.content_type,
  };
}

export async function downloadContentImage(bucketId: string, objectPath: string) {
  if (bucketId !== "content-images") return null;
  const file = await createSupabaseAnon().storage.from(bucketId).download(objectPath);
  if (file.error || !file.data) return null;
  return file.data;
}
