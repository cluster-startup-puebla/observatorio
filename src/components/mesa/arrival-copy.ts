const reasons: Record<string, string> = {
  "sin qr": "Ese código no tiene pase.",
  "sin lectura": "No se leyó ningún pase.",
  "sin sesión": "Vuelve a iniciar sesión para registrar llegadas.",
  "transición inválida": "Esta persona ya registró su llegada.",
  "ya llegó": "Esta persona ya registró su llegada.",
  "Escribe el código del QR.": "No se leyó ningún pase.",
};

export function arrivalDetail(error?: string) {
  if (!error) return "La asistencia quedó registrada.";
  if (reasons[error]) return reasons[error];
  if (error.startsWith("sin sesión")) return "Vuelve a iniciar sesión para registrar llegadas.";
  if (error.startsWith("sin qr")) return "Ese código no tiene pase.";
  return error;
}
