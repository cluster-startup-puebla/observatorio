export type Speaker = {
  name: string;
  position: string;
  company: string;
  slot: string;
  topic: string;
  photo: string;
};

const photo = (file: string) => `/ponentes/${file}.webp`;

export const speakers: Speaker[] = [
  {
    name: "Alejandro Preinfalk",
    position: "Presidente y CEO",
    company: "Siemens México, Centroamérica y el Caribe",
    slot: "Keynote de apertura · 08:40–09:10",
    topic:
      "Competitividad industrial: de la necesidad tecnológica a una implementación que mejore productividad, resiliencia y capacidad de escalar",
    photo: photo("alejandro-preinfalk"),
  },
  {
    name: "Fausto López Aguilar",
    position: "Gerente de Tratados Internacionales · Vicepresidente COMCE Sur",
    company: "Volkswagen de México / COMCE Sur",
    slot: "Panelista · 09:10–09:55",
    topic:
      "Panel «De la necesidad a la adopción»: T-MEC, reglas de origen, trazabilidad, digitalización aduanera",
    photo: photo("fausto-lopez-aguilar"),
  },
  {
    name: "Francisco Corona",
    position: "Director de Tecnología (CTO)",
    company: "Microsoft México",
    slot: "Panelista · 09:10–09:55",
    topic:
      "Panel «De la necesidad a la adopción»: nube, IA, arquitectura, seguridad y llevar casos de uso a producción",
    photo: photo("francisco-corona"),
  },
  {
    name: "María Ariza García Migoya",
    position: "Directora General",
    company: "Bolsa Institucional de Valores (BIVA)",
    slot: "Panelista · 09:10–09:55",
    topic:
      "Panel «De la necesidad a la adopción»: financiamiento, gobierno corporativo e institucionalización",
    photo: photo("maria-ariza-garcia-migoya"),
  },
  {
    name: "Mónica Flores Barragán",
    position: "Presidenta Regional para Latinoamérica",
    company: "ManpowerGroup",
    slot: "Panelista · 09:10–09:55",
    topic:
      "Panel «De la necesidad a la adopción»: talento, habilidades digitales, reconversión y gestión del cambio",
    photo: photo("monica-flores-barragan"),
  },
  {
    name: "Juan Carlos Baker Pineda",
    position: "Director General y Socio Fundador",
    company: "Consultores Internacionales Ansley",
    slot: "Keynote de cierre · 11:05–11:35",
    topic:
      "De los datos empresariales a una agenda de competitividad: qué información necesita México para defender y ampliar oportunidades en Norteamérica",
    photo: photo("juan-carlos-baker-pineda"),
  },
];
