import type { CrmStatus } from "@/lib/crm-status";
import { arrivalPlan } from "@/lib/admin/pases/scan";

export function recordArrival(input: {
  hasPass: boolean;
  hasArrival: boolean;
  crmStatus: CrmStatus | null;
  profileId: string;
  scannedBy: string;
}) {
  const plan = arrivalPlan({
    hasPass: input.hasPass,
    hasArrival: input.hasArrival,
    crmStatus: input.crmStatus,
  });
  if (!plan.ok) return plan;
  return {
    ok: true as const,
    arrival: { profile_id: input.profileId, scanned_by: input.scannedBy },
    crmEvent: plan.crmEvent,
  };
}
