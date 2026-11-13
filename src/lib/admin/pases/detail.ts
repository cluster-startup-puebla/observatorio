import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { passObjectPath } from "@/lib/storage-assets";
import { buildPassFace } from "./relations";

export async function loadPase(profileId: string) {
  const db = await adminDb();
  if (!db) return null;
  const pass = await db.from("passes").select("profile_id, image_asset_id, issued_at").eq("profile_id", profileId).maybeSingle();
  if (pass.error) throw new Error(pass.error.message);
  if (!pass.data) return null;
  const [arrival, profile, contact, asset, company] = await Promise.all([
    db.from("arrivals").select("profile_id, scanned_at, scanned_by").eq("profile_id", profileId).maybeSingle(),
    db.from("profiles").select("full_name, email, job_title, whatsapp, role").eq("id", profileId).maybeSingle(),
    db.from("crm_contacts").select("id").eq("profile_id", profileId).maybeSingle(),
    db.from("media_assets").select("object_path").eq("id", pass.data.image_asset_id).maybeSingle(),
    db.from("companies").select("id, legal_name, employee_band, municipality, session_interest, sector_id").eq("profile_id", profileId).maybeSingle(),
  ]);
  for (const result of [arrival, profile, contact, asset, company]) {
    if (result.error) throw new Error(result.error.message);
  }
  let crmStatus: string | null = null;
  if (contact.data) {
    const current = await db.from("crm_contact_status").select("status").eq("contact_id", contact.data.id).maybeSingle();
    if (current.error) throw new Error(current.error.message);
    crmStatus = current.data?.status ?? null;
  }
  const sector = company.data?.sector_id
    ? await db.from("sectors").select("name, id").eq("id", company.data.sector_id).maybeSingle()
    : { data: null, error: null };
  if (sector.error) throw new Error(sector.error.message);
  const scannedBy = arrival.data?.scanned_by;
  const scannerProfile = scannedBy
    ? await db.from("profiles").select("full_name, email").eq("id", scannedBy).maybeSingle()
    : { data: null, error: null };
  if (scannerProfile.error) throw new Error(scannerProfile.error.message);
  const scanner = scannerProfile.data?.full_name?.trim() || scannerProfile.data?.email || "";
  return {
    pass: pass.data,
    path: asset.data?.object_path ?? passObjectPath(profileId),
    arrival: arrival.data,
    profile: profile.data,
    contactId: contact.data?.id ?? null,
    crmStatus,
    face: buildPassFace({
      profileId,
      assetId: pass.data.image_asset_id,
      issuedAt: pass.data.issued_at,
      arrivedAt: arrival.data?.scanned_at ?? "",
      scanner,
      profile: profile.data,
      company: company.data,
      sector: sector.data,
    }),
  };
}
