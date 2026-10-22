import { adminDb } from "@/lib/admin/admin-db";
import { logoObjectPath } from "@/lib/storage-assets";
import type { LogoBytes } from "./logo-file";

type Db = NonNullable<Awaited<ReturnType<typeof adminDb>>>;

export async function storeOrganizationLogo(db: Db, id: string, logo: LogoBytes) {
  const objectPath = logoObjectPath(id, logo.contentType);
  const uploaded = await db.storage.from("organization-logos").upload(objectPath, logo.bytes, {
    upsert: true,
    contentType: logo.contentType,
  });
  if (uploaded.error) return { ok: false as const, reason: uploaded.error.message };
  const existing = await db.from("media_assets").select("id").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle();
  const payload = { object_path: objectPath, content_type: logo.contentType, byte_size: logo.bytes.byteLength };
  const saved = existing.data
    ? await db.from("media_assets").update(payload).eq("id", existing.data.id)
    : await db.from("media_assets").insert({
        ...payload,
        purpose: "organization_logo",
        bucket_id: "organization-logos",
        organization_id: id,
      });
  if (saved.error) return { ok: false as const, reason: saved.error.message };
  return { ok: true as const };
}
