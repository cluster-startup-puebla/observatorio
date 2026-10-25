const subjects = {
  password: "Crea tu contraseña para la sesión",
  event_pass: "Tu pase para la sesión ya está listo",
  open_innovation: "¿Quieres ser una empresa de innovación abierta?",
  welcome: "Tu lugar en el Observatorio ya está apartado",
  reminder: "Mañana es la sesión del Observatorio",
  thanks: "Gracias por venir a la sesión",
} as const;

export function mailFor(kind: keyof typeof subjects, email: string) {
  const to = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("correo inválido");
  return { kind, to, subject: subjects[kind] };
}
