import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "Revisa tu correo para confirmar tu cuenta.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage(
    "Revisa tu correo",
    "Revisa tu correo para confirmar tu cuenta del Observatorio.",
  );
}
