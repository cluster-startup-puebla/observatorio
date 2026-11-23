import { redirectTo } from "@/lib/admin/redirect";
import { removeBy } from "@/lib/admin/remove-row";
import { loadSessionAttendees } from "@/lib/admin/sesiones/load-attendees";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { updateSession } from "@/lib/admin/sesiones/update-session";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadSesion(id);
  if (!row) return Response.json({ error: "no encontrada" }, { status: 404 });
  const attending = await loadSessionAttendees(id);
  return Response.json({ ...row, attending });
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
  const saved = await updateSession(id, form);
  if (!saved.ok) return redirectTo(request, `${list}?error=${encodeURIComponent(saved.reason)}`);
  return redirectTo(request, list);
}
