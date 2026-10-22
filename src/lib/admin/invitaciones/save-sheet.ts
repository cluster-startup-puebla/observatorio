import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import { csvRows, inviteSave, invitesFromSheet } from "./sheet";

export async function saveInviteSheet(form: FormData) {
  const organizationId = String(form.get("organization_id") ?? "");
  const file = form.get("archivo");
  if (!organizationId || !(file instanceof File)) return { ok: false as const, reason: "faltan organismo o archivo" };
  const parsed = invitesFromSheet(csvRows(await file.text()), organizationId);
  if (parsed.errors.length) return { ok: false as const, reason: parsed.errors[0]?.reason ?? "archivo inválido" };
  const db = await adminDb();
  const account = await readSuperadmin();
  if (!db || !account) return { ok: false as const, reason: "sin sesión" };
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  for (const contact of parsed.contacts) {
    const existing = await db.from("crm_contacts").select("id").eq("organization_id", organizationId).eq("email", contact.email).maybeSingle();
    if (existing.error) return { ok: false as const, reason: existing.error.message };
    if (inviteSave(Boolean(existing.data)) === "update" && existing.data) {
      const updated = await db.from("crm_contacts").update({ nombre: contact.nombre, empresa: contact.empresa }).eq("id", existing.data.id);
      if (updated.error) return { ok: false as const, reason: updated.error.message };
      continue;
    }
    const inserted = await db.from("crm_contacts").insert({
      organization_id: organizationId,
      nombre: contact.nombre,
      empresa: contact.empresa,
      email: contact.email,
      source: contact.source,
    }).select("id").single();
    if (inserted.error) return { ok: false as const, reason: inserted.error.message };
    const event = await db.from("crm_events").insert({ contact_id: inserted.data.id, event: contact.event, actor_id: actor.data?.id ?? null });
    if (event.error) return { ok: false as const, reason: event.error.message };
  }
  return { ok: true as const };
}
