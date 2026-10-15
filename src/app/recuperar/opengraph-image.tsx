import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "Pide un enlace para elegir una contraseña nueva.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage(
    "Recuperar contraseña",
    "Pide un enlace para elegir una contraseña nueva.",
  );
}
