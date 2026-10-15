import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "Entrar al Observatorio Tecnológico de Puebla.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage("Entrar", "Entra a tu cuenta del Observatorio Tecnológico de Puebla.");
}
