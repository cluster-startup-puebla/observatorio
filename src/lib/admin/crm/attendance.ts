import { arrivalPlan } from "@/lib/admin/pases/scan";
import type { CrmStatus } from "@/lib/crm-status";

export function attendanceAction(input: { hasPass: boolean; arrivedAt: string; status: CrmStatus | null }) {
  if (!input.hasPass) return { kind: "missing" as const };
  if (input.arrivedAt) return { kind: "done" as const };
  const plan = arrivalPlan({ hasPass: true, hasArrival: false, crmStatus: input.status });
  if (!plan.ok) return { kind: "blocked" as const };
  return { kind: "ready" as const };
}
