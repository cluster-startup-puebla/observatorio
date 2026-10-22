import { adminDb } from "@/lib/admin/admin-db";
import { listCrm } from "@/lib/admin/crm/list";
import { manualInvite } from "@/lib/admin/invitaciones/manual";
import { readSuperadmin, requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await requireSuperadmin();
  return Response.json(await listCrm(request.nextUrl.searchParams.get("page") ?? undefined));
}

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
  if (!draft.ok) return NextResponse.redirect(new URL(`/admin/crm?error=${encodeURIComponent(draft.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL("/admin/crm?error=sin%20sesi%C3%B3n", request.url));
  const inserted = await db.from("crm_contacts").insert({
    organization_id: draft.contact.organization_id,
    nombre: draft.contact.nombre,
    empresa: draft.contact.empresa,
    email: draft.contact.email,
    source: "manual",
  }).select("id").single();
  if (inserted.error || !inserted.data) {
    const reason = inserted.error?.message ?? "no se creó";
    return NextResponse.redirect(new URL(`/admin/crm?error=${encodeURIComponent(reason)}`, request.url));
  }
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  await db.from("crm_events").insert({ contact_id: inserted.data.id, event: "cargar", actor_id: actor.data?.id ?? null });
  return NextResponse.redirect(new URL(`/admin/crm/${inserted.data.id}`, request.url));
}
