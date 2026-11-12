const labels: Record<string, string> = {
  empresario: "Empresario",
  director: "Director",
  capturista: "Capturista",
  invitador: "Invitador",
  superadmin: "Superadmin",
  moderador: "Moderador",
};

export type AccountKind = "empresario" | "organismo" | "panel";

export function accountKind(role: string): AccountKind {
  if (role === "empresario") return "empresario";
  if (role === "director" || role === "capturista" || role === "invitador") return "organismo";
  return "panel";
}

export function roleLabel(role: string) {
  return labels[role] ?? role;
}

export function cuentaTabList(kind: AccountKind) {
  const ficha = { value: "ficha", label: "Ficha" };
  if (kind !== "empresario") return [ficha];
  return [ficha, { value: "pase", label: "Pase" }, { value: "respuestas", label: "Respuestas" }, { value: "correos", label: "Correos" }];
}

export function cuentaStat(kind: AccountKind, hasPass: boolean) {
  if (kind === "empresario") return { value: hasPass ? "Sí" : "No", label: "Pase" };
  if (kind === "organismo") return { value: "Equipo", label: "Cuenta" };
  return { value: "Panel", label: "Cuenta" };
}
