import { adminDb } from "@/lib/admin/admin-db";
import { loadCrm } from "@/lib/admin/crm/detail";
import { nextCrmInsert } from "@/lib/admin/crm/next-event";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const form = await request.formData();
  const current = await loadCrm(id);
  const back = `/admin/crm/${id}?tab=hechos`;
  if (!current) return NextResponse.redirect(new URL(`${back}&error=no%20encontrado`, request.url));
  const next = nextCrmInsert((current.statusCode as CrmStatus | null) ?? null, String(form.get("event") ?? ""));
  if (!next.ok) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(next.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}&error=sin%20sesi%C3%B3n`, request.url));
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  const inserted = await db.from("crm_events").insert({
    contact_id: id,
    event: next.event,
    actor_id: actor.data?.id ?? null,
  });
  if (inserted.error) return NextResponse.redirect(new URL(`${back}&error=${encodeURIComponent(inserted.error.message)}`, request.url));
  return NextResponse.redirect(new URL(back, request.url));
}
