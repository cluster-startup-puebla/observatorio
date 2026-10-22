import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { passObjectPath } from "@/lib/storage-assets";

export async function loadPase(profileId: string) {
  const db = await adminDb();
  if (!db) return null;
  const pass = await db.from("passes").select("profile_id, image_asset_id, issued_at").eq("profile_id", profileId).maybeSingle();
  if (pass.error) throw new Error(pass.error.message);
  if (!pass.data) return null;
  const [arrival, profile, contact, asset] = await Promise.all([
    db.from("arrivals").select("profile_id, scanned_at").eq("profile_id", profileId).maybeSingle(),
    db.from("profiles").select("full_name, email").eq("id", profileId).maybeSingle(),
    db.from("crm_contacts").select("id").eq("profile_id", profileId).maybeSingle(),
    db.from("media_assets").select("object_path").eq("id", pass.data.image_asset_id).maybeSingle(),
  ]);
  for (const result of [arrival, profile, contact, asset]) {
    if (result.error) throw new Error(result.error.message);
  }
  let crmStatus: string | null = null;
  if (contact.data) {
    const current = await db.from("crm_contact_status").select("status").eq("contact_id", contact.data.id).maybeSingle();
    if (current.error) throw new Error(current.error.message);
    crmStatus = current.data?.status ?? null;
  }
  return {
    pass: pass.data,
    path: asset.data?.object_path ?? passObjectPath(profileId),
    arrival: arrival.data,
    profile: profile.data,
    contactId: contact.data?.id ?? null,
    crmStatus,
  };
}
