const subjects = {
  password: "Crea tu contraseña para la sesión",
  event_pass: "Tu pase para la sesión ya está listo",
  open_innovation: "¿Quieres ser una empresa de innovación abierta?",
} as const;

export function mailFor(kind: keyof typeof subjects, email: string) {
  const to = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("correo inválido");
  return { kind, to, subject: subjects[kind] };
}
