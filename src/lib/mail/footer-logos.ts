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
