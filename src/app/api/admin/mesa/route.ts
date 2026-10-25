import { mesaHref } from "@/lib/admin/mesa/href";
import { recordArrival } from "@/lib/admin/mesa/record";
import { requireMesa } from "@/lib/auth/guards";
import type { CrmStatus } from "@/lib/crm-status";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

function redirectTo(request: NextRequest, query: string) {
  return NextResponse.redirect(new URL(`${mesaHref}?${query}`, request.url));
}

export async function POST(request: NextRequest) {
  const account = await requireMesa();
  const form = await request.formData();
  const profileId = String(form.get("codigo") ?? "").trim();
  const token = account ? await readAccessToken() : null;
  const db = token ? createSupabaseWithAccess(token) : null;
  if (!db || !account || !profileId) return redirectTo(request, "error=sin%20qr");

  const [pass, arrival, contact] = await Promise.all([
    db.from("passes").select("profile_id").eq("profile_id", profileId).maybeSingle(),
    db.from("arrivals").select("profile_id").eq("profile_id", profileId).maybeSingle(),
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
    scannedBy: account.id,
  });
  if (!plan.ok) return redirectTo(request, `codigo=${profileId}&error=${encodeURIComponent(plan.reason)}`);
  const inserted = await db.from("arrivals").insert(plan.arrival);
  if (inserted.error) return redirectTo(request, `error=${encodeURIComponent(inserted.error.message)}`);
  if (plan.crmEvent && contact.data) {
    await db.from("crm_events").insert({
      contact_id: contact.data.id,
      event: plan.crmEvent,
      actor_id: account.id,
    });
  }
  const profile = await db.from("profiles").select("full_name").eq("id", profileId).maybeSingle();
  const query = new URLSearchParams({
    codigo: profileId,
    nombre: profile.data?.full_name ?? "",
    estatus: "llego",
  });
  return NextResponse.redirect(new URL(`${mesaHref}?${query}`, request.url));
}
