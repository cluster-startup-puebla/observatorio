import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { mediaPreviewPath } from "./public-access";
import { purposeLabel } from "./purpose-label";

export async function listMedios(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const result = await db
    .from("media_assets")
    .select("id, purpose, bucket_id, object_path, content_type, byte_size")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      purpose: row.purpose,
      purpose_label: purposeLabel(row.purpose),
      preview: mediaPreviewPath(row.purpose, row.id),
      bucket_id: row.bucket_id,
      object_path: row.object_path,
      content_type: row.content_type,
      byte_size: String(row.byte_size),
    })),
  };
}
