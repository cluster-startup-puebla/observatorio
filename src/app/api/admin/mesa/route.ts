import { adminDb } from "@/lib/admin/admin-db";
import { mesaHref } from "@/lib/admin/mesa/href";
import { recordArrival } from "@/lib/admin/mesa/record";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { readSuperadmin } from "@/lib/auth/require-superadmin";
import type { CrmStatus } from "@/lib/crm-status";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const account = await readSuperadmin();
  const form = await request.formData();
  const profileId = String(form.get("codigo") ?? "").trim();
  const back = mesaHref;
  const db = await adminDb();
  if (!db || !account || !profileId) return NextResponse.redirect(new URL(`${back}?error=sin%20qr`, request.url));
  const [pass, arrival, actor, contact] = await Promise.all([
    db.from("passes").select("profile_id").eq("profile_id", profileId).maybeSingle(),
    db.from("arrivals").select("profile_id").eq("profile_id", profileId).maybeSingle(),
    db.from("profiles").select("id").eq("email", account.email).maybeSingle(),
    db.from("crm_contacts").select("id").eq("profile_id", profileId).maybeSingle(),
  ]);
  let crmStatus: CrmStatus | null = null;
  if (contact.data) {
    const status = await db.from("crm_contact_status").select("status").eq("contact_id", contact.data.id).maybeSingle();
    crmStatus = (status.data?.status as CrmStatus | null) ?? null;
  }
  const plan = recordArrival({
    hasPass: Boolean(pass.data),
    hasArrival: Boolean(arrival.data),
    crmStatus,
    profileId,
    scannedBy: actor.data?.id ?? "",
  });
  if (!plan.ok) return NextResponse.redirect(new URL(`${back}?codigo=${profileId}&error=${encodeURIComponent(plan.reason)}`, request.url));
  const inserted = await db.from("arrivals").insert(plan.arrival);
  if (inserted.error) return NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(inserted.error.message)}`, request.url));
  if (plan.crmEvent && contact.data) {
    await db.from("crm_events").insert({ contact_id: contact.data.id, event: plan.crmEvent, actor_id: actor.data?.id ?? null });
  }
  const profile = await db.from("profiles").select("full_name").eq("id", profileId).maybeSingle();
  return NextResponse.redirect(new URL(`${mesaHref}/${profileId}?nombre=${encodeURIComponent(profile.data?.full_name ?? "")}`, request.url));
}
