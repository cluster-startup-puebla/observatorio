export type OrgEstado = "pendiente" | "contactado" | "confirmado";

const bucket: Record<string, OrgEstado | undefined> = {
  cargado: "pendiente",
  contactado: "contactado",
  confirmo: "confirmado",
  registrado: "confirmado",
  llego: "confirmado",
};

const labels: Record<OrgEstado, string> = {
  pendiente: "Pendiente",
  contactado: "Contactado",
  confirmado: "Confirmado",
};

export function orgEstado(status: string): OrgEstado | null {
  return bucket[status] ?? null;
}

export function orgEstadoLabel(status: string) {
  const estado = orgEstado(status);
  return estado ? labels[estado] : "No";
}
