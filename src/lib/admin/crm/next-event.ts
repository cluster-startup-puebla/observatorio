import { applyCrmEvent, type CrmEvent, type CrmStatus } from "@/lib/crm-status";

const panelEvents = ["contactar", "rechazar", "confirmar", "registrar", "llegar"] as const;
type PanelEvent = (typeof panelEvents)[number];

export function nextCrmInsert(status: CrmStatus | null, event: string) {
  if (!panelEvents.includes(event as PanelEvent)) {
    return { ok: false as const, reason: "hecho inválido" };
  }
  const next = applyCrmEvent(status, event as CrmEvent);
  if (!next.ok) return { ok: false as const, reason: next.reason };
  return { ok: true as const, event: event as PanelEvent };
}
