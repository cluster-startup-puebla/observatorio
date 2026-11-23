import { guestQuery, mesaGuest } from "@/lib/admin/mesa/guest";
import { mesaHref } from "@/lib/admin/mesa/href";
import { resolveMesaCode } from "@/lib/admin/mesa/resolve-code";
import { recordArrival } from "@/lib/admin/mesa/record";
import { requireMesa } from "@/lib/auth/guards";
import { rsvpOnlyCheckIn } from "@/lib/admin/pases/scan";
import type { CrmStatus } from "@/lib/crm-status";
import { maybeAwardArrival } from "@/lib/lavas/maybe-award-arrival";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { NextResponse, type NextRequest } from "next/server";

function redirectTo(request: NextRequest, query: string) {
  return NextResponse.redirect(new URL(`${mesaHref}?${query}`, request.url), 303);
}

async function guestFromRsvp(
  db: Awaited<ReturnType<typeof createSupabaseWithAccess>>,
  rsvpId: string,
  request: NextRequest,
) {
  const listed = await db.rpc("mesa_rsvp_guest", { p_rsvp_id: rsvpId });
  if (listed.error) return redirectTo(request, `error=${encodeURIComponent(listed.error.message)}`);
  const row = Array.isArray(listed.data) ? listed.data[0] : listed.data;
  const plan = rsvpOnlyCheckIn({ rsvpConfirmed: Boolean(row) });
  if (!plan.ok) return redirectTo(request, `error=${encodeURIComponent(plan.reason)}`);
  return redirectTo(request, guestQuery(rsvpId, mesaGuest(row ?? null)));
}

export async function POST(request: NextRequest) {
  const account = await requireMesa();
  const form = await request.formData();
  const rawCode = String(form.get("codigo") ?? "").trim();
  const token = account ? await readAccessToken() : null;
  const db = token ? createSupabaseWithAccess(token) : null;
  if (!db || !account || !rawCode) return redirectTo(request, "error=sin%20qr");

  const resolved = await resolveMesaCode(db, rawCode);
  if (!resolved) return redirectTo(request, "error=sin%20qr");
  if (resolved.kind === "rsvp" && !resolved.profileId) {
    return guestFromRsvp(db, resolved.rsvpId, request);
  }

  const profileId = resolved.kind === "profile" ? resolved.profileId : (resolved.profileId as string);
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
  const hasRsvpPass = resolved.kind === "rsvp";
  const plan = recordArrival({
    hasPass: Boolean(pass.data) || hasRsvpPass,
    hasArrival: Boolean(arrival.data),
    crmStatus,
    profileId,
    scannedBy: account.id,
  });
  if (!plan.ok) return redirectTo(request, `codigo=${profileId}&error=${encodeURIComponent(plan.reason)}`);
  const inserted = await db.from("arrivals").insert(plan.arrival);
  if (inserted.error) return redirectTo(request, `error=${encodeURIComponent(inserted.error.message)}`);
  const company = await db.from("companies").select("id").eq("profile_id", profileId).maybeSingle();
  if (company.data?.id) {
    await maybeAwardArrival(db, { companyId: company.data.id, profileId }).catch((error) =>
      console.error("lavas llegada", error),
    );
  }
  if (plan.crmEvent && contact.data) {
    await db.from("crm_events").insert({
      contact_id: contact.data.id,
      event: plan.crmEvent,
      actor_id: account.id,
    });
  }
  const listed = await db.rpc("mesa_guest", { guest_id: profileId });
  if (listed.error) console.error("mesa_guest", listed.error.message);
  const row = Array.isArray(listed.data) ? listed.data[0] : listed.data;
  return redirectTo(request, guestQuery(profileId, mesaGuest(row ?? null)));
}