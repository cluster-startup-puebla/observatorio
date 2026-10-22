const allowed = new Set([
  "ese rol no se crea aquí",
  "ese rol exige organismo",
  "Escribe un correo válido.",
  "Usa al menos 8 caracteres.",
]);

export function staffCreateError(message: string) {
  if (allowed.has(message)) return message;
  const lower = message.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("unique") || lower.includes("already")) {
    return "Ese correo ya está registrado.";
  }
  return "No se pudo crear la cuenta. Intenta de nuevo.";
}
