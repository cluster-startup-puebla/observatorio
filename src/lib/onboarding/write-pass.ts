import type { SupabaseClient } from "@supabase/supabase-js";
import { passQrAttachment } from "@/lib/mail/pass-qr";
import { passObjectPath } from "@/lib/storage-assets";

async function qrAsset(db: SupabaseClient, profileId: string) {
  const saved = await db.from("media_assets").select("id").eq("profile_id", profileId).eq("purpose", "pass_qr").maybeSingle();
  if (saved.error) return null;
  if (saved.data?.id) return saved.data.id as string;

  const qr = await passQrAttachment(profileId);
  const bytes = Buffer.from(qr.content, "base64");
  const path = passObjectPath(profileId);
  const uploaded = await db.storage.from("pass-images").upload(path, bytes, { upsert: true, contentType: "image/png" });
  if (uploaded.error) return null;
  const media = await db
    .from("media_assets")
    .insert({
      purpose: "pass_qr",
      bucket_id: "pass-images",
      object_path: path,
      content_type: "image/png",
      byte_size: bytes.byteLength,
      width_px: 280,
      height_px: 280,
      profile_id: profileId,
      uploaded_by: profileId,
    })
    .select("id")
    .maybeSingle();
  if (media.error || !media.data) return null;
  return media.data.id as string;
}

export async function writePass(db: SupabaseClient, profileId: string) {
  try {
    const existing = await db.from("passes").select("profile_id").eq("profile_id", profileId).maybeSingle();
    if (existing.error) {
      console.error("writePass", existing.error.message);
      return { ok: false as const };
    }
    if (existing.data) return { ok: true as const };
    const assetId = await qrAsset(db, profileId);
    if (!assetId) return { ok: false as const };
    const pass = await db.from("passes").insert({ profile_id: profileId, image_asset_id: assetId });
    if (pass.error) {
      console.error("writePass", pass.error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (error) {
    console.error("writePass", error);
    return { ok: false as const };
  }
}
