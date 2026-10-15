import { siteDescription, siteName } from "@/lib/metadata";
import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "Observatorio Tecnológico de Puebla. Levantamiento de necesidades.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage(siteName, siteDescription);
}
