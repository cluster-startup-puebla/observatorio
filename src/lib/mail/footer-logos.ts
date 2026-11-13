import { conveners } from "@/content/conveners";
import { clusterLogo } from "@/content/landing";

export type MailLogo = { src: string; alt: string; width: number; height: number };

function correoSrc(src: string) {
  return src.replace(/^\/logos\//, "/logos/correo/").replace(/\.(webp|svg)$/, ".png");
}

export const operaLogos: MailLogo[] = [
  { src: correoSrc(clusterLogo.src), alt: clusterLogo.alt, width: clusterLogo.width, height: clusterLogo.height },
];

export const backingLogos: MailLogo[] = [
  { src: correoSrc("/logos/logo-estado.svg"), alt: "Gobierno del Estado de Puebla", width: 301, height: 126 },
  { src: correoSrc("/logos/logo-sedetra.png"), alt: "Secretaría de Desarrollo Económico y Trabajo", width: 1106, height: 253 },
  { src: correoSrc("/logos/logo-secihti.png"), alt: "Secretaría de Ciencia, Humanidades, Tecnología e Innovación", width: 501, height: 274 },
  { src: correoSrc("/logos/logo-por-amor-a-puebla.svg"), alt: "Por amor a Puebla", width: 147, height: 59 },
  { src: correoSrc("/logos/logo-transformar-en-grande.png"), alt: "Transformar en Grande", width: 806, height: 251 },
];

export const convenerLogos: MailLogo[] = conveners.map((logo) => ({
  src: correoSrc(logo.src),
  alt: logo.alt,
  width: logo.width,
  height: logo.height,
}));

export function absoluteLogo(src: string, assetBase: string) {
  return `${assetBase.replace(/\/$/, "")}${src}`;
}

export function logoBox(logo: { width: number; height: number }) {
  const maxHeight = 40;
  const maxWidth = 108;
  const ratio = logo.width / Math.max(logo.height, 1);
  let width = Math.round(maxHeight * ratio);
  let height = maxHeight;
  if (width > maxWidth) {
    width = maxWidth;
    height = Math.max(20, Math.round(maxWidth / ratio));
  }
  return { width, height };
}

export function logoRows<T>(logos: T[], size: number) {
  const rows: T[][] = [];
  for (let index = 0; index < logos.length; index += size) rows.push(logos.slice(index, index + size));
  return rows;
}
