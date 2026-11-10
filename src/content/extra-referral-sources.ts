import { conveners } from "@/content/conveners";

const covered = new Set([
  "Consejo Coordinador Empresarial Puebla",
  "CANACINTRA Puebla",
  "COPARMEX Puebla",
  "AMMJE",
  "AMMJE Angelópolis",
  "Clúster Agronomía y Alimentos",
  "Clúster Plásticos y Economía Circular",
  "CLAUZ Clúster Automotriz Zona Centro",
]);

export const extraReferralSources = conveners
  .filter((logo) => !covered.has(logo.alt))
  .map((logo) => ({
    src: logo.src,
    alt: logo.alt,
    width: logo.width,
    height: logo.height,
    className: "h-8 w-auto sm:h-10",
  }));
