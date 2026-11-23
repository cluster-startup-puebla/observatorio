import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { sessionSectorChoices } from "@/lib/admin/sesiones/choices";
import { currentFlip } from "@/lib/admin/sesiones/current";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { sessionIdentityFromForm } from "@/lib/admin/sesiones/identity";
import { sessionShapeFromForm } from "@/lib/admin/sesiones/kinds";
import { quotaDraft } from "@/lib/admin/sesiones/quotas";
import { scheduleFromForm } from "@/lib/admin/sesiones/schedule";
import { saveSessionQuotas } from "@/lib/admin/sesiones/save-quotas";
import { isKnownInstrument } from "@/lib/methodology/v2/instrument-options";

export async function updateSession(id: string, form: FormData) {
  const current = await loadSesion(id);
  if (!current) return { ok: false as const, reason: "no encontrada" };
  const identity = sessionIdentityFromForm(form, current.session);
  if (!identity.ok) return identity;
  const shape = sessionShapeFromForm(form, current.session);
  if (!shape.ok) return shape;
  if (shape.instrument_id && !isKnownInstrument(shape.instrument_id)) {
    return { ok: false as const, reason: "Instrumento desconocido." };
  }
  const sectors = await sessionSectorChoices();
  const capacityMin = Number(form.get("capacity_min") ?? current.session.capacity_min);
  const draft = quotaDraft(form, sectors.map((sector) => sector.id), capacityMin);
  if (!draft.ok) return draft;
  const capacityMax = draft.total > 0 ? draft.total : Number(form.get("capacity_max") ?? current.session.capacity_max);
  const schedule = scheduleFromForm(form, current.session);
  if (!schedule.ok) return schedule;
  const flip = currentFlip(current.rows, id, form.get("is_current") === "on");
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "No se pudo guardar. Intenta de nuevo." };
  const updated = await db
    .from("sessions")
    .update({
      title: identity.title,
      venue: String(form.get("venue") ?? current.session.venue),
      format_name: String(form.get("format_name") ?? current.session.format_name),
      modality: shape.modality,
      kind: shape.kind,
      instrument_id: shape.instrument_id,
      ...schedule.fields,
      capacity_min: capacityMin,
      capacity_max: capacityMax,
      audience: String(form.get("audience") ?? current.session.audience),
      includes: String(form.get("includes") ?? current.session.includes),
      is_current: flip.isCurrent,
    })
    .eq("id", flip.setId);
  if (updated.error) {
    console.error("sessions update", updated.error);
    return { ok: false as const, reason: "No se pudo guardar. Intenta de nuevo." };
  }
  const saved = await saveSessionQuotas(id, draft.rows);
  if (!saved.ok) return saved;
  return { ok: true as const };
}
