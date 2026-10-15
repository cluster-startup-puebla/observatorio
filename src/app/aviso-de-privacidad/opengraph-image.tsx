import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "Cómo se tratan los datos que compartes en la sesión sectorial.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage(
    "Aviso de privacidad",
    "Cómo se tratan los datos que compartes en la sesión sectorial.",
  );
}
