import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "Elige una contraseña nueva para tu cuenta.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage("Nueva contraseña", "Elige una contraseña nueva para tu cuenta.");
}
