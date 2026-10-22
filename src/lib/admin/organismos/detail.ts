import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function loadOrganismo(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const org = await db.from("organizations").select("id, name, brand_color, brand_completed_at").eq("id", id).maybeSingle();
  if (org.error) throw new Error(org.error.message);
  if (!org.data) return null;
  const [members, contacts, copies, logo, sectors] = await Promise.all([
    db.from("profiles").select("id, full_name, email, role").eq("organization_id", id),
    db.from("crm_contacts").select("id, nombre, empresa, email, source").eq("organization_id", id),
    db.from("link_copies").select("id, sector_id, created_at").eq("organization_id", id),
    db.from("media_assets").select("id, object_path, content_type").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle(),
    db.from("sectors").select("id, slug, name").order("position"),
  ]);
  for (const result of [members, contacts, copies, logo, sectors]) {
    if (result.error) throw new Error(result.error.message);
  }
  return { org: org.data, members: members.data ?? [], contacts: contacts.data ?? [], copies: copies.data ?? [], logo: logo.data, sectors: sectors.data ?? [] };
}
