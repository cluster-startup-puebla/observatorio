import { logoObjectPath } from "@/lib/storage-assets";
import type { adminDb } from "@/lib/admin/admin-db";
import type { LogoBytes } from "./logo-file";

type Db = NonNullable<Awaited<ReturnType<typeof adminDb>>>;

export async function createRemoteOrganismo(
  db: Db,
  input: { name: string; brandColor: string; logo: LogoBytes | null },
) {
  const id = crypto.randomUUID();
  if (!input.logo) {
    const inserted = await db.from("organizations").insert({
      id,
      name: input.name,
      brand_color: input.brandColor,
      brand_completed_at: null,
    }).select("id").single();
    if (inserted.error || !inserted.data) return { ok: false as const, reason: inserted.error?.message ?? "no se creó" };
    return { ok: true as const, id };
  }

  const objectPath = logoObjectPath(id, input.logo.contentType);
  const uploaded = await db.storage.from("organization-logos").upload(objectPath, input.logo.bytes, {
    upsert: true,
    contentType: input.logo.contentType,
  });
  if (uploaded.error) return { ok: false as const, reason: uploaded.error.message };

  const saved = await db.rpc("create_organization_brand", {
    org_id: id,
    org_name: input.name,
    org_color: input.brandColor,
    logo_path: objectPath,
    logo_type: input.logo.contentType,
    logo_bytes: input.logo.bytes.byteLength,
  });
  if (saved.error) {
    await db.storage.from("organization-logos").remove([objectPath]);
    return { ok: false as const, reason: saved.error.message };
  }
  return { ok: true as const, id };
}
