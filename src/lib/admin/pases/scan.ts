import { applyCrmEvent, type CrmStatus } from "@/lib/crm-status";

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function looksLikeUuid(value: string) {
  return uuidRe.test(value.trim());
}

export function arrivalPlan(input: { hasPass: boolean; hasArrival: boolean; crmStatus: CrmStatus | null }) {
  if (!input.hasPass) return { ok: false as const, reason: "sin qr" };
  if (input.hasArrival) return { ok: false as const, reason: "ya llegó" };
  if (input.crmStatus === null) return { ok: true as const, insertArrival: true, crmEvent: null };
  const crm = applyCrmEvent(input.crmStatus, "llegar");
  if (!crm.ok) return { ok: false as const, reason: crm.reason };
  return { ok: true as const, insertArrival: true, crmEvent: "llegar" as const };
}

/** RSVP confirmado sin cuenta: check-in OK sin fila en arrivals (sin profile_id). */
export function rsvpOnlyCheckIn(input: { rsvpConfirmed: boolean }) {
  if (!input.rsvpConfirmed) return { ok: false as const, reason: "sin qr" };
  return { ok: true as const, recordArrival: false };
}