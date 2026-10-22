import { adminDb } from "@/lib/admin/admin-db";
import { listSesiones } from "@/lib/admin/sesiones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listSesiones(request.nextUrl.searchParams.get("page") ?? undefined));
}

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const form = await request.formData();
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL("/admin/sesiones?error=sin%20sesi%C3%B3n", request.url));
  const inserted = await db.from("sessions").insert({
    venue: String(form.get("venue") ?? "").trim(),
    format_name: String(form.get("format_name") ?? "").trim(),
    starts_local: String(form.get("starts_local") ?? ""),
    ends_local: String(form.get("ends_local") ?? ""),
    capacity_min: Number(form.get("capacity_min") ?? 0),
    capacity_max: Number(form.get("capacity_max") ?? 0),
    audience: String(form.get("audience") ?? "").trim(),
    includes: String(form.get("includes") ?? "").trim(),
    is_current: false,
  }).select("id").single();
  if (inserted.error || !inserted.data) {
    return NextResponse.redirect(new URL(`/admin/sesiones?error=${encodeURIComponent(inserted.error?.message ?? "no se creó")}`, request.url));
  }
  return NextResponse.redirect(new URL(`/admin/sesiones/${inserted.data.id}`, request.url));
}
