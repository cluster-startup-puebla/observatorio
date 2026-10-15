import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "Reserva tu lugar en la sesión de tu sector.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage(
    "Reserva tu lugar",
    "La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas.",
  );
}
