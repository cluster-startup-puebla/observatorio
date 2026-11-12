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

const sources: Record<string, string> = {
  enlace: "Enlace",
  excel: "Excel",
  manual: "Manual",
};

export function crmSourceLabel(source: string) {
  return sources[source] ?? source;
}

const events: Record<string, string> = {
  cargar: "Cargó",
  contactar: "Contactó",
  confirmar: "Confirmó",
  registrar: "Registró",
  llegar: "Llegó",
  rechazar: "Rechazó",
};

export function crmEventLabel(event: string) {
  return events[event] ?? event;
}
