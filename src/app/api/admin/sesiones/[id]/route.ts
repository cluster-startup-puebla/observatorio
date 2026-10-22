import { adminDb } from "@/lib/admin/admin-db";
import { currentFlip } from "@/lib/admin/sesiones/current";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

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
  const back = `/admin/sesiones/${id}`;
  const current = await loadSesion(id);
  if (!current) return NextResponse.redirect(new URL(`${back}?error=no%20encontrada`, request.url));
  const flip = currentFlip(current.rows, id, form.get("is_current") === "on");
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  if (flip.clearIds.length) {
    const cleared = await db.from("sessions").update({ is_current: false }).in("id", flip.clearIds);
    if (cleared.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(cleared.error.message)}`, request.url));
  }
  const updated = await db.from("sessions").update({
    venue: String(form.get("venue") ?? current.session.venue),
    format_name: String(form.get("format_name") ?? current.session.format_name),
    starts_local: String(form.get("starts_local") ?? current.session.starts_local),
    ends_local: String(form.get("ends_local") ?? current.session.ends_local),
    capacity_min: Number(form.get("capacity_min") ?? current.session.capacity_min),
    capacity_max: Number(form.get("capacity_max") ?? current.session.capacity_max),
    audience: String(form.get("audience") ?? current.session.audience),
    includes: String(form.get("includes") ?? current.session.includes),
    is_current: flip.isCurrent,
  }).eq("id", flip.setId);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
