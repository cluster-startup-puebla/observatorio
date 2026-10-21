export type CrmStatus = "cargado" | "contactado" | "confirmo" | "registrado" | "llego" | "no";

export type CrmEvent = "cargar" | "contactar" | "confirmar" | "registrar" | "llegar" | "rechazar";

const allowed: Record<CrmStatus, CrmEvent[]> = {
  cargado: ["contactar", "confirmar", "rechazar"],
  contactado: ["confirmar", "rechazar"],
  confirmo: ["registrar", "rechazar"],
  registrado: ["llegar", "rechazar"],
  llego: [],
  no: [],
};

const produced: Record<Exclude<CrmEvent, "cargar">, CrmStatus> = {
  contactar: "contactado",
  confirmar: "confirmo",
  registrar: "registrado",
  llegar: "llego",
  rechazar: "no",
};

export function applyCrmEvent(
  status: CrmStatus | null,
  event: CrmEvent,
): { ok: true; status: CrmStatus } | { ok: false; status: CrmStatus | null; reason: string } {
  if (event === "cargar") {
    if (status) return { ok: false, status, reason: "transición inválida" };
    return { ok: true, status: "cargado" };
  }
  if (!status || !allowed[status].includes(event)) {
    return { ok: false, status, reason: "transición inválida" };
  }
  return { ok: true, status: produced[event] };
}
