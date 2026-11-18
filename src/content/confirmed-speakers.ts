import type { Speaker } from "@/content/speakers";

const photo = (file: string) => `/ponentes/${file}.webp`;

export const confirmedSpeakers: Speaker[] = [
  {
    name: "Fausto López Aguilar",
    position: "Gerente de Tratados Internacionales · Vicepresidente COMCE Sur",
    company: "Volkswagen de México / COMCE Sur",
    slot: "Ponente · 11:00–11:30",
    topic: "Ventajas de la adopción tecnológica para la industria poblana ante el T-MEC",
    photo: photo("fausto-lopez-aguilar"),
    confirmed: true,
  },
  {
    name: "Silvia Ávila Cholula",
    position: "Presidenta",
    company: "Clúster de Plásticos y Economía Circular de Puebla",
    slot: "Panelista · 10:30–11:00",
    topic: "Economía circular Puebla y Nuevo León",
    photo: photo("silvia-avila"),
    confirmed: true,
  },
  {
    name: "Yamil Álvarez",
    position: "Presidente",
    company: "Clúster de Startups e Innovación",
    slot: "Cierre · 11:30–11:35",
    topic: "Cierre y conclusiones",
    photo: photo("yamil-alvarez"),
    confirmed: true,
  },
  {
    name: "Arturo Rech",
    position: "Presidente y CEO",
    company: "MexHub de Economía Circular",
    slot: "Panelista · 10:30–11:00",
    topic: "Economía circular Puebla y Nuevo León",
    photo: photo("arturo-rech"),
    confirmed: true,
  },
];
