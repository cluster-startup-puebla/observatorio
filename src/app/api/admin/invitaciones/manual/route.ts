import { adminDb } from "@/lib/admin/admin-db";
import { manualInvite } from "@/lib/admin/invitaciones/manual";
import { inviteSave } from "@/lib/admin/invitaciones/sheet";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const form = await request.formData();
  const draft = manualInvite({
    nombre: String(form.get("nombre") ?? ""),
    empresa: String(form.get("empresa") ?? ""),
    correo: String(form.get("correo") ?? ""),
    organizationId: String(form.get("organization_id") ?? ""),
  });
  if (!draft.ok) return NextResponse.redirect(new URL(`/admin/invitaciones?error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL("/admin/invitaciones?error=sin%20sesi%C3%B3n", request.url));
  const existing = await db.from("crm_contacts").select("id").eq("organization_id", draft.contact.organization_id).eq("email", draft.contact.email).maybeSingle();
  if (inviteSave(Boolean(existing.data)) === "update" && existing.data) {
    await db.from("crm_contacts").update({ nombre: draft.contact.nombre, empresa: draft.contact.empresa }).eq("id", existing.data.id);
    return NextResponse.redirect(new URL(`/admin/invitaciones/${existing.data.id}`, request.url));
  }
  const inserted = await db.from("crm_contacts").insert({
    organization_id: draft.contact.organization_id,
    nombre: draft.contact.nombre,
    empresa: draft.contact.empresa,
    email: draft.contact.email,
    source: draft.contact.source,
  }).select("id").single();
  if (inserted.error || !inserted.data) {
    return NextResponse.redirect(new URL(`/admin/invitaciones?error=${encodeURIComponent(inserted.error?.message ?? "no se guardó")}`, request.url));
  }
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  await db.from("crm_events").insert({ contact_id: inserted.data.id, event: "cargar", actor_id: actor.data?.id ?? null });
  return NextResponse.redirect(new URL(`/admin/invitaciones/${inserted.data.id}`, request.url));
}
