import { isLinkAccepted } from "@/lib/crm/link-acceptance";

export type InviteOutcome = "espera" | "cerrado" | "pase";

export function inviteOutcome(statuses: (string | null)[]): InviteOutcome {
  if (statuses.length === 0) return "espera";
  if (statuses.some((status) => !status || status === "cargado" || status === "contactado")) return "espera";
  if (statuses.every((status) => status === "no")) return "cerrado";
  if (statuses.some((status) => !isLinkAccepted(status))) return "espera";
  return "pase";
}
