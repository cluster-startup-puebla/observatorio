export function broadcastSentLine(sent: number) {
  if (sent === 0) return "No había correos nuevos por enviar.";
  if (sent === 1) return "Se envió 1 correo.";
  return `Se enviaron ${sent} correos.`;
}
