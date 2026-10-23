import { adminDb } from "@/lib/admin/admin-db";
import { eventPath } from "@/lib/admin/organismos/brand";
import { boundSessionId } from "@/lib/organismo/invite-path";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import { sealRef } from "@/lib/ref-token";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const sectorId = String(form.get("sector_id") ?? "");
  const back = `/admin/organismos/${id}?tab=enlace`;
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url), 303);
  const sector = await db.from("sectors").select("slug").eq("id", sectorId).maybeSingle();
  if (!sector.data) return NextResponse.redirect(new URL(`${back}&error=sector%20inv%C3%A1lido`, request.url), 303);
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  if (!actor.data) return NextResponse.redirect(new URL(`${back}&error=sin%20actor`, request.url), 303);
  const token = sealRef(id, process.env.REF_SECRET ?? "");
  const currents = await db.from("sessions").select("id").eq("is_current", true);
  if (currents.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(currents.error.message)}`, request.url), 303);
  const bound = boundSessionId(String(form.get("session_id") ?? ""), (currents.data ?? []).map((row) => row.id));
  if (!bound.ok) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(bound.reason)}`, request.url), 303);
  const inserted = await db.from("link_copies").insert({
    organization_id: id,
    sector_id: sectorId,
    actor_id: actor.data.id,
    session_id: bound.sessionId,
  });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(inserted.error.message)}`, request.url), 303);
  const path = eventPath(sector.data.slug, token, bound.sessionId);
  return NextResponse.redirect(new URL(`${back}&enlace=${encodeURIComponent(path)}`, request.url), 303);
}
