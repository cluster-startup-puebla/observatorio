export function accountErrors(input: { email: string; password: string }) {
  const errors: { email?: string; password?: string } = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Escribe un correo válido.";
  }
  if (input.password.trim().length < 8) {
    errors.password = "Usa al menos 8 caracteres.";
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
