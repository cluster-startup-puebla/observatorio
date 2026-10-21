const labels: Record<string, string> = {
  cargado: "Cargado",
  contactado: "Contactado",
  confirmo: "Confirmó",
  registrado: "Registrado",
  llego: "Llegó",
  no: "No",
};

export function crmLabel(status: string) {
  return labels[status] ?? status;
}
