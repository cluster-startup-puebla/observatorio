import { adminDb } from "@/lib/admin/admin-db";
import { removeBy } from "@/lib/admin/remove-row";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { brandStamp } from "./brand";
import { readLogoFile } from "./logo-file";
import { memoryCreateOrganismo, memoryRemoveOrganismo, memoryUpdateOrganismo } from "./memory";
import { organizationPatch } from "./organization-patch";
import { createRemoteOrganismo } from "./create-remote";
import { storeOrganizationLogo } from "./store-logo";

async function logoFrom(form: FormData) {
  const logo = await readLogoFile(form.get("logo"));
  if (logo && "error" in logo) return { ok: false as const, reason: logo.error };
  return { ok: true as const, logo };
}

export async function createOrganization(form: FormData) {
  const patch = organizationPatch({ name: String(form.get("name") ?? ""), brandColor: String(form.get("brand_color") ?? "") });
  if (!patch.ok) return patch;
  const parsed = await logoFrom(form);
  if (!parsed.ok) return parsed;
  if (!usesSupabaseAuth()) return { ok: true as const, id: memoryCreateOrganismo(patch.name, patch.brand_color, parsed.logo) };
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "sin sesión" };
  return createRemoteOrganismo(db, { name: patch.name, brandColor: patch.brand_color, logo: parsed.logo });
}

export async function updateOrganization(id: string, form: FormData) {
  const patch = organizationPatch({ name: String(form.get("name") ?? ""), brandColor: String(form.get("brand_color") ?? "") });
  if (!patch.ok) return patch;
  const parsed = await logoFrom(form);
  if (!parsed.ok) return parsed;
  if (!usesSupabaseAuth()) {
    return memoryUpdateOrganismo(id, patch.name, patch.brand_color, parsed.logo)
      ? { ok: true as const }
      : { ok: false as const, reason: "no encontrado" };
  }
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "sin sesión" };
  if (parsed.logo) {
    const stored = await storeOrganizationLogo(db, id, parsed.logo);
    if (!stored.ok) return stored;
  }
  const current = await db.from("media_assets").select("id").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle();
  const updated = await db.from("organizations").update({
    name: patch.name,
    brand_color: patch.brand_color,
    brand_completed_at: brandStamp({ name: patch.name, brandColor: patch.brand_color, hasLogo: Boolean(current.data) }),
  }).eq("id", id);
  if (updated.error) return { ok: false as const, reason: updated.error.message };
  return { ok: true as const };
}

export async function removeOrganization(id: string) {
  if (!usesSupabaseAuth()) {
    return memoryRemoveOrganismo(id) ? { ok: true as const } : { ok: false as const, reason: "no encontrado" };
  }
  return removeBy("organizations", "id", id);
}
