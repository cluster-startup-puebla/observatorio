import { adminDb } from "@/lib/admin/admin-db";
import { loadCrm } from "@/lib/admin/crm/detail";
import { manualInvite } from "@/lib/admin/invitaciones/manual";
import { removeBy } from "@/lib/admin/remove-row";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadCrm(id);
  if (!row) return Response.json({ error: "no encontrado" }, { status: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const back = `/admin/crm/${id}`;
  if (form.get("accion") === "eliminar") {
    const removed = await removeBy("crm_contacts", "id", id);
    const path = removed.ok ? "/admin/crm" : `${back}?error=${encodeURIComponent(removed.reason)}`;
    return NextResponse.redirect(new URL(path, request.url));
  }
  const current = await loadCrm(id);
  if (!current) return NextResponse.redirect(new URL(`${back}?error=no%20encontrado`, request.url));
  const draft = manualInvite({
    nombre: String(form.get("nombre") ?? ""),
    empresa: String(form.get("empresa") ?? ""),
    correo: String(form.get("correo") ?? ""),
    organizationId: current.contact.organization_id,
  });
  if (!draft.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const updated = await db.from("crm_contacts").update({
    nombre: draft.contact.nombre,
    empresa: draft.contact.empresa,
    email: draft.contact.email,
  }).eq("id", id);
  if (updated.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(updated.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
