const accepted = new Set(["confirmo", "registrado", "llego"]);

export function waitsForExternalApproval(source: string, admittedAt: string | null) {
  return source === "path" && !admittedAt;
}

export function externalApprovalLabel(
  source: string,
  admittedAt: string | null,
  statuses: (string | null)[] = [],
) {
  const known = statuses.filter((status): status is string => Boolean(status));
  if (known.length > 0) {
    if (known.every((status) => status === "no")) return "Rechazada";
    if (known.some((status) => accepted.has(status))) return "Aceptada";
    return "Pendiente";
  }
  if (source === "path") return admittedAt ? "Aceptada" : "Pendiente";
  return "Sin organismo";
}

export function acceptorLabel(convener: string, source: string, admittedBy: string) {
  if (convener && convener !== "—") return convener;
  if (source === "path") return admittedBy || "Superadmin";
  return "Nadie";
}
