const accepted = new Set(["confirmo", "registrado", "llego"]);

/** Legacy path gate for pase/onboarding. Diagnósticos usan admitted_at en todos los orígenes. */
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
    if (known.some((status) => accepted.has(status))) return "Aceptada en lista";
    return "Pendiente en lista";
  }
  if (admittedAt) return "Aceptada";
  if (source === "path") return "Sin aceptar";
  return "Sin aceptar";
}

export function acceptorLabel(convener: string, source: string, admittedBy: string) {
  if (convener && convener !== "—") return convener;
  if (source === "path" || admittedBy) return admittedBy || "Superadmin";
  return "Nadie";
}
