import { applyCrmEvent, type CrmStatus } from "@/lib/crm-status";

export function arrivalPlan(input: { hasPass: boolean; hasArrival: boolean; crmStatus: CrmStatus | null }) {
  if (!input.hasPass) return { ok: false as const, reason: "sin qr" };
  if (input.hasArrival) return { ok: false as const, reason: "ya llegó" };
  if (input.crmStatus === null) return { ok: true as const, insertArrival: true, crmEvent: null };
  const crm = applyCrmEvent(input.crmStatus, "llegar");
  if (!crm.ok) return { ok: false as const, reason: crm.reason };
  return { ok: true as const, insertArrival: true, crmEvent: "llegar" as const };
}
