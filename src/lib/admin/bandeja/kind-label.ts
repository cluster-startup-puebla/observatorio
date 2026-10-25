const labels: Record<string, string> = {
  password: "Contraseña",
  event_pass: "Pase",
  open_innovation: "Innovación abierta",
  welcome: "Bienvenida",
  reminder: "Recordatorio",
  thanks: "Gracias",
};

export function kindLabel(kind: string) {
  return labels[kind] ?? kind;
}
