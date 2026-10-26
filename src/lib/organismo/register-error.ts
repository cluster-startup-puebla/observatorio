const messages: Record<string, string> = {
  existe: "Ese correo ya está registrado. Inicia sesión con él.",
  contrasena: "Usa al menos 8 caracteres.",
  confirmar: "Confirma el correo antes de entrar.",
  limite: "Hay demasiados intentos. Espera un momento e inténtalo de nuevo.",
  auth: "No se pudo crear la cuenta. Revisa el correo y usa al menos 8 caracteres.",
};

export function registerError(code: string | undefined) {
  if (!code) return "";
  return messages[code] ?? messages.auth;
}
