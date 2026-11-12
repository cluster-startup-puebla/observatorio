import { adminDb } from "@/lib/admin/admin-db";
import { loadCrm } from "@/lib/admin/crm/detail";
import { arrivalPlan } from "@/lib/admin/pases/scan";
import { readSuperadmin, requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

const reasons: Record<string, string> = {
  "sin qr": "Esta persona no tiene pase.",
  "ya llegó": "Ya estaba marcada como asistió.",
  "transición inválida": "Solo se marca asistencia cuando ya está registrada.",
};

function back(request: NextRequest, id: string, error?: string) {
  const path = error ? `/admin/crm/${id}?error=${encodeURIComponent(error)}` : `/admin/crm/${id}`;
  return NextResponse.redirect(new URL(path, request.url));
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const { id } = await context.params;
  const current = await loadCrm(id);
  if (!current?.pass || !current.person.profileId) return back(request, id, reasons["sin qr"]);
  const plan = arrivalPlan({
    hasPass: true,
    hasArrival: Boolean(current.pass.arrivedAt),
    crmStatus: (current.statusCode as CrmStatus | null) ?? null,
  });
  if (!plan.ok) return back(request, id, reasons[plan.reason] ?? plan.reason);
  const db = await adminDb();
  if (!db || !account) return back(request, id, "Sin sesión.");
  const actor = await db.from("profiles").select("id").eq("email", account.email).maybeSingle();
  if (!actor.data) return back(request, id, "Sin sesión.");
  const arrival = await db.from("arrivals").insert({ profile_id: current.person.profileId, scanned_by: actor.data.id });
  if (arrival.error) return back(request, id, arrival.error.message);
  if (plan.crmEvent) {
    const event = await db.from("crm_events").insert({ contact_id: id, event: plan.crmEvent, actor_id: actor.data.id });
    if (event.error) return back(request, id, event.error.message);
  }
  return back(request, id);
}
