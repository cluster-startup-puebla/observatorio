import { conveners } from "@/content/conveners";
import { clusterLogo } from "@/content/landing";

export type MailLogo = { src: string; alt: string; width: number; height: number };

export const operaLogos: MailLogo[] = [
  { src: clusterLogo.src, alt: clusterLogo.alt, width: clusterLogo.width, height: clusterLogo.height },
];

export const backingLogos: MailLogo[] = [
  { src: "/logos/logo-estado.svg", alt: "Gobierno del Estado de Puebla", width: 301, height: 126 },
  { src: "/logos/logo-sedetra.png", alt: "Secretaría de Desarrollo Económico y Trabajo", width: 1106, height: 253 },
  { src: "/logos/logo-cinco-de-mayo.png", alt: "5 de Mayo", width: 333, height: 252 },
];

export const convenerLogos: MailLogo[] = conveners.map((logo) => ({
  src: logo.src,
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
