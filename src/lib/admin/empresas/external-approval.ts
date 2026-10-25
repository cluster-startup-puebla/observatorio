export function waitsForExternalApproval(source: string, admittedAt: string | null) {
  return source === "path" && !admittedAt;
}

export function externalApprovalLabel(source: string, admittedAt: string | null) {
  if (source !== "path") return "No aplica";
  return admittedAt ? "Aceptada" : "Pendiente";
}
