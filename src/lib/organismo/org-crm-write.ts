import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { InviteInput } from "@/lib/directory";

type Source = "manual" | "excel";

export async function importOrgInvites(
  db: SupabaseClient,
  input: { orgId: string; actorId: string; source: Source; rows: InviteInput[] },
) {
  for (const row of input.rows) {
    const existing = await db
      .from("crm_contacts")
      .select("id")
      .eq("organization_id", input.orgId)
      .eq("email", row.correo)
      .maybeSingle();
    if (existing.error) return { ok: false as const, reason: existing.error.message };
    if (existing.data) continue;
    const inserted = await db
      .from("crm_contacts")
      .insert({
        organization_id: input.orgId,
        nombre: row.nombre,
        empresa: row.empresa,
        email: row.correo,
        source: input.source,
      })
      .select("id")
      .single();
    if (inserted.error || !inserted.data) {
      return { ok: false as const, reason: inserted.error?.message ?? "no se guardó" };
    }
    const event = await db.from("crm_events").insert({
      contact_id: inserted.data.id,
      event: "cargar",
      actor_id: input.actorId,
    });
    if (event.error) return { ok: false as const, reason: event.error.message };
  }
  return { ok: true as const };
}

export async function contactOrgPerson(db: SupabaseClient, actorId: string, personId: string) {
  const event = await db.from("crm_events").insert({
    contact_id: personId,
    event: "contactar",
    actor_id: actorId,
  });
  if (event.error) return { ok: false as const, reason: event.error.message };
  return { ok: true as const };
}
