import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { currentOption } from "@/lib/sessions/face";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { memoryLoadOrganismo } from "./memory";

export async function loadOrganismo(id: string) {
  if (!usesSupabaseAuth()) return memoryLoadOrganismo(id);
  const db = await adminDb();
  if (!db) return null;
  const org = await db.from("organizations").select("id, name, brand_color, brand_completed_at").eq("id", id).maybeSingle();
  if (org.error) throw new Error(org.error.message);
  if (!org.data) return null;
  const [members, contacts, copies, logo, sectors, sessions] = await Promise.all([
    db.from("profiles").select("id, full_name, email, role").eq("organization_id", id),
    db.from("crm_contacts").select("id, nombre, empresa, email, source").eq("organization_id", id),
    db.from("link_copies").select("id, sector_id, created_at").eq("organization_id", id),
    db.from("media_assets").select("id, object_path, content_type").eq("organization_id", id).eq("purpose", "organization_logo").maybeSingle(),
    db.from("sectors").select("id, slug, name").order("position"),
    db.from("sessions").select("id, venue, session_on, starts_local, ends_local").eq("is_current", true).order("session_on").order("starts_local"),
  ]);
  for (const result of [members, contacts, copies, logo, sectors, sessions]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    org: org.data,
    members: members.data ?? [],
    contacts: contacts.data ?? [],
    copies: copies.data ?? [],
    logo: logo.data,
    sectors: sectors.data ?? [],
    sessions: (sessions.data ?? []).map((row) => currentOption(row)),
  };
}
