import { ImageResponse } from "next/og";
import { OgCard } from "./og-card";
import { ogFonts } from "@/lib/og/fonts";

export const alt = "Puebla x Puebla. Levantamiento de necesidades tecnológicas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(<OgCard />, {
    ...size,
    fonts: await ogFonts(),
  });
}
