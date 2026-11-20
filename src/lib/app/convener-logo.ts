import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const sectorCluster: Record<string, string> = {
  "plasticos-y-hule": "cluster-de-plasticos-puebla",
  agroindustria: "cluster-agroindustria-puebla",
  "alimentos-y-bebidas": "cluster-agroindustria-puebla",
  "automotriz-y-autopartes": "clauz-puebla",
  "mueble-y-madera": "cluster-de-muebles-puebla",
  turismo: "vive-puebla",
};

async function logoForOrg(db: SupabaseClient, orgId: string) {
  const brand = await db.rpc("organization_invite_brand", { org_id: orgId });
  const row = Array.isArray(brand.data) ? brand.data[0] : brand.data;
  const path = row && typeof row.logo_path === "string" ? row.logo_path.trim() : "";
  if (!path) return null;
  const signed = await db.storage.from("organization-logos").createSignedUrl(path, 60 * 60 * 24);
  return signed.data?.signedUrl ?? null;
}

async function invitedOrg(db: SupabaseClient, email: string) {
  const contact = await db
    .from("crm_contacts")
    .select("organization_id")
    .eq("source", "enlace")
    .eq("email", email.trim().toLowerCase())
    .limit(1)
    .maybeSingle();
  const orgId = contact.data?.organization_id;
  return typeof orgId === "string" ? orgId : null;
}

async function sectorOrg(db: SupabaseClient, sectorSlug: string) {
  const slug = sectorCluster[sectorSlug];
  if (!slug) return null;
  const org = await db.from("organizations").select("id").eq("slug", slug).maybeSingle();
  return typeof org.data?.id === "string" ? org.data.id : null;
}

export async function convenerLogoUrl(db: SupabaseClient, email: string, sectorSlug: string) {
  const orgId = (await invitedOrg(db, email)) ?? (await sectorOrg(db, sectorSlug));
  if (!orgId) return null;
  return logoForOrg(db, orgId);
}
