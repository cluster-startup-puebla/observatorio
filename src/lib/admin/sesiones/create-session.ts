import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { sessionSectorChoices } from "@/lib/admin/sesiones/choices";
import { sessionIdentityFromForm } from "@/lib/admin/sesiones/identity";
import { sessionShapeFromForm } from "@/lib/admin/sesiones/kinds";
import { quotaDraft } from "@/lib/admin/sesiones/quotas";
import { scheduleFromForm } from "@/lib/admin/sesiones/schedule";
import { saveSessionQuotas } from "@/lib/admin/sesiones/save-quotas";
import { isKnownInstrument } from "@/lib/methodology/v2/instrument-options";

export async function createSession(form: FormData) {
  const identity = sessionIdentityFromForm(form);
  if (!identity.ok) return identity;
  const shape = sessionShapeFromForm(form);
  if (!shape.ok) return shape;
  if (shape.instrument_id && !isKnownInstrument(shape.instrument_id)) {
    return { ok: false as const, reason: "Instrumento desconocido." };
  }
  const schedule = scheduleFromForm(form);
  if (!schedule.ok) return schedule;
  const sectors = await sessionSectorChoices();
  const capacityMin = Number(form.get("capacity_min") ?? 0);
  const draft = quotaDraft(form, sectors.map((sector) => sector.id), capacityMin);
  if (!draft.ok) return draft;
  const capacityMax = draft.total > 0 ? draft.total : Number(form.get("capacity_max") ?? 0);
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "No se pudo crear la sesión. Intenta de nuevo." };
  const inserted = await db
    .from("sessions")
    .insert({
      title: identity.title,
      public_slug: identity.public_slug,
      venue: String(form.get("venue") ?? "").trim(),
      format_name: String(form.get("format_name") ?? "").trim(),
      modality: shape.modality,
      kind: shape.kind,
      instrument_id: shape.instrument_id,
      ...schedule.fields,
      capacity_min: capacityMin,
      capacity_max: capacityMax,
      audience: String(form.get("audience") ?? "").trim(),
      includes: String(form.get("includes") ?? "").trim(),
      is_current: false,
    })
    .select("id")
    .single();
  if (inserted.error || !inserted.data) {
    console.error("sessions insert", inserted.error);
    if (inserted.error?.message?.includes("sessions_public_slug")) {
      return { ok: false as const, reason: "Ese enlace público ya existe. Cambia el título o la fecha." };
    }
    return { ok: false as const, reason: "No se pudo crear la sesión. Intenta de nuevo." };
  }
  const saved = await saveSessionQuotas(inserted.data.id, draft.rows);
  if (!saved.ok) {
    await db.from("sessions").delete().eq("id", inserted.data.id);
    return saved;
  }
  return { ok: true as const, id: inserted.data.id };
}
