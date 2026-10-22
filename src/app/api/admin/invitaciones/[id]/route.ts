import { adminDb } from "@/lib/admin/admin-db";
import { loadInvitacion } from "@/lib/admin/invitaciones/detail";
import { manualInvite } from "@/lib/admin/invitaciones/manual";
import { nextCrmInsert } from "@/lib/admin/crm/next-event";
import { removeBy } from "@/lib/admin/remove-row";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await context.params;
  const row = await loadInvitacion(id);
  if (!row) return Response.json({ error: "no encontrada" }, { ["status"]: 404 });
  return Response.json(row);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const current = await loadInvitacion(id);
  const back = `/admin/invitaciones/${id}`;
  if (form.get("accion") === "eliminar") {
    const removed = await removeBy("crm_contacts", "id", id);
    const path = removed.ok ? "/admin/invitaciones" : `${back}?error=${encodeURIComponent(removed.reason)}`;
    return NextResponse.redirect(new URL(path, request.url));
  }
  if (!current) return NextResponse.redirect(new URL(`${back}?error=no%20encontrada`, request.url));
  if (form.get("accion") === "guardar") {
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
  const next = nextCrmInsert((current.statusCode as CrmStatus | null) ?? null, "confirmar");
  if (!next.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(next.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  const inserted = await db.from("crm_events").insert({ contact_id: id, event: "confirmar", actor_id: actor.data?.id ?? null });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(inserted.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
