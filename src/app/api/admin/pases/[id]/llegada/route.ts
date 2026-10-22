import { adminDb } from "@/lib/admin/admin-db";
import { loadPase } from "@/lib/admin/pases/detail";
import { arrivalPlan } from "@/lib/admin/pases/scan";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const back = `/admin/pases/${id}`;
  const current = await loadPase(id);
  if (!current) return NextResponse.redirect(new URL(`${back}?error=sin%20qr`, request.url));
  const plan = arrivalPlan({
    hasPass: true,
    hasArrival: Boolean(current.arrival),
    crmStatus: (current.crmStatus as CrmStatus | null) ?? null,
  });
  if (!plan.ok) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(plan.reason)}`, request.url));
  const db = await adminDb();
  if (!db || !account) return NextResponse.redirect(new URL(`${back}?error=sin%20sesi%C3%B3n`, request.url));
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  if (!actor.data) return NextResponse.redirect(new URL(`${back}?error=sin%20actor`, request.url));
  const arrival = await db.from("arrivals").insert({ profile_id: id, scanned_by: actor.data.id });
  if (arrival.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(arrival.error.message)}`, request.url));
  if (plan.crmEvent && current.contactId) {
    const event = await db.from("crm_events").insert({ contact_id: current.contactId, event: plan.crmEvent, actor_id: actor.data.id });
    if (event.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(event.error.message)}`, request.url));
  }
  return NextResponse.redirect(new URL(back, request.url));
}
