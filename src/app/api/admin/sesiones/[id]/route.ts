import { adminDb } from "@/lib/admin/admin-db";
import { redirectTo } from "@/lib/admin/redirect";
import { removeBy } from "@/lib/admin/remove-row";
import { sessionSectorChoices } from "@/lib/admin/sesiones/choices";
import { currentFlip } from "@/lib/admin/sesiones/current";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { quotaDraft } from "@/lib/admin/sesiones/quotas";
import { saveSessionQuotas } from "@/lib/admin/sesiones/save-quotas";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadSesion(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const list = "/admin/sesiones";
  if (form.get("accion") === "eliminar") {
    const removed = await removeBy("sessions", "id", id);
    const path = removed.ok ? list : `${list}?error=${encodeURIComponent(removed.reason)}`;
    return redirectTo(request, path);
  }
  const current = await loadSesion(id);
  if (!current) return redirectTo(request, `${list}?error=${encodeURIComponent("no encontrada")}`);
  const sectors = await sessionSectorChoices();
  const capacityMin = Number(form.get("capacity_min") ?? current.session.capacity_min);
  const draft = quotaDraft(form, sectors.map((sector) => sector.id), capacityMin);
  if (!draft.ok) return redirectTo(request, `${list}?error=${encodeURIComponent(draft.reason)}`);
  const capacityMax = draft.total > 0 ? draft.total : Number(form.get("capacity_max") ?? current.session.capacity_max);
  const flip = currentFlip(current.rows, id, form.get("is_current") === "on");
  const db = await adminDb();
  if (!db) {
    console.error("sesiones update: sin sesión");
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo guardar. Intenta de nuevo.")}`);
  }
  if (flip.clearIds.length) {
    const cleared = await db.from("sessions").update({ is_current: false }).in("id", flip.clearIds);
    if (cleared.error) {
      console.error("sessions clear current", cleared.error);
      return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo guardar. Intenta de nuevo.")}`);
    }
  }
  const updated = await db
    .from("sessions")
    .update({
      venue: String(form.get("venue") ?? current.session.venue),
      format_name: String(form.get("format_name") ?? current.session.format_name),
      starts_local: String(form.get("starts_local") ?? current.session.starts_local),
      ends_local: String(form.get("ends_local") ?? current.session.ends_local),
      capacity_min: capacityMin,
      capacity_max: capacityMax,
      audience: String(form.get("audience") ?? current.session.audience),
      includes: String(form.get("includes") ?? current.session.includes),
      is_current: flip.isCurrent,
    })
    .eq("id", flip.setId);
  if (updated.error) {
    console.error("sessions update", updated.error);
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo guardar. Intenta de nuevo.")}`);
  }
  const saved = await saveSessionQuotas(id, draft.rows);
  if (!saved.ok) return redirectTo(request, `${list}?error=${encodeURIComponent(saved.reason)}`);
  return redirectTo(request, list);
}
