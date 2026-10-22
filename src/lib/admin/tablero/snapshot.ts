import { orgBars } from "@/lib/admin/tablero/org-bars";
import { paceBars } from "@/lib/admin/tablero/pace-bars";
import type { Tablero, TableroContact, TableroEvent, TableroOrg, TableroStatus } from "@/lib/admin/tablero/types";

const inviteSources = new Set(["excel", "manual"]);
const confirmed = new Set(["confirmo", "registrado", "llego"]);

const stages = [
  { status: "cargado", etapa: "Sin contactar", fill: "var(--warning)" },
  { status: "contactado", etapa: "Contactados", fill: "var(--info)" },
  { status: "confirmo", etapa: "Confirmaron", fill: "var(--brand-primary)" },
  { status: "registrado", etapa: "Registrados", fill: "var(--brand-secondary)" },
  { status: "llego", etapa: "Llegaron", fill: "var(--success)" },
  { status: "no", etapa: "No van", fill: "var(--text-muted)" },
] as const;

export function emptyTablero(): Tablero {
  return buildTablero({ contacts: [], statuses: [], orgs: [], confirmations: [] });
}

export function buildTablero(input: {
  contacts: TableroContact[];
  statuses: TableroStatus[];
  orgs: TableroOrg[];
  confirmations: TableroEvent[];
  now?: Date;
}): Tablero {
  const statusOf = new Map(input.statuses.map((row) => [row.contactId, row.status]));
  const invites = input.contacts.filter((row) => inviteSources.has(row.source));
  const counts = new Map<string, number>();
  for (const row of invites) {
    const status = statusOf.get(row.id) || "cargado";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  const invitations = invites.length;
  const confirmations = [...confirmed].reduce((sum, status) => sum + (counts.get(status) ?? 0), 0);
  return {
    invitations,
    confirmations,
    linkSignups: input.contacts.filter((row) => row.source === "enlace").length,
    rate: invitations === 0 ? 0 : Math.round((confirmations / invitations) * 100),
    funnel: stages.map((stage) => ({ etapa: stage.etapa, personas: counts.get(stage.status) ?? 0, fill: stage.fill })),
    byOrg: orgBars(invites, statusOf, input.orgs),
    pace: paceBars(input.confirmations, new Set(invites.map((row) => row.id)), input.now ?? new Date()),
    pendingContact: counts.get("cargado") ?? 0,
    pendingConfirm: counts.get("contactado") ?? 0,
    pendingRegister: counts.get("confirmo") ?? 0,
    declined: counts.get("no") ?? 0,
  };
}
