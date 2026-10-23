import { adminDb } from "@/lib/admin/admin-db";
import { redirectTo } from "@/lib/admin/redirect";
import { sessionSectorChoices } from "@/lib/admin/sesiones/choices";
import { listSesiones } from "@/lib/admin/sesiones/list";
import { quotaDraft } from "@/lib/admin/sesiones/quotas";
import { scheduleFromForm } from "@/lib/admin/sesiones/schedule";
import { saveSessionQuotas } from "@/lib/admin/sesiones/save-quotas";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listSesiones(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const list = "/admin/sesiones";
  const schedule = scheduleFromForm(form);
  if (!schedule.ok) return redirectTo(request, `${list}?error=${encodeURIComponent(schedule.reason)}`);
  const sectors = await sessionSectorChoices();
  const capacityMin = Number(form.get("capacity_min") ?? 0);
  const draft = quotaDraft(form, sectors.map((sector) => sector.id), capacityMin);
  if (!draft.ok) return redirectTo(request, `${list}?error=${encodeURIComponent(draft.reason)}`);
  const capacityMax = draft.total > 0 ? draft.total : Number(form.get("capacity_max") ?? 0);
  const db = await adminDb();
  if (!db) {
    console.error("sesiones POST: sin sesión");
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo crear la sesión. Intenta de nuevo.")}`);
  }
  const inserted = await db
    .from("sessions")
    .insert({
      venue: String(form.get("venue") ?? "").trim(),
      format_name: String(form.get("format_name") ?? "").trim(),
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
    return redirectTo(request, `${list}?error=${encodeURIComponent("No se pudo crear la sesión. Intenta de nuevo.")}`);
  }
  const saved = await saveSessionQuotas(inserted.data.id, draft.rows);
  if (!saved.ok) {
    await db.from("sessions").delete().eq("id", inserted.data.id);
    return redirectTo(request, `${list}?error=${encodeURIComponent(saved.reason)}`);
  }
  return redirectTo(request, list);
}
