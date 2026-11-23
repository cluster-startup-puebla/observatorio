export type DisruptorsSpeaker = {
  number: string;
  name: string;
  role: string;
  photo: string;
};

const photo = (file: string) => `/disruptors/${file}`;

export const disruptorsSpeakers: DisruptorsSpeaker[] = [
  {
    number: "01",
    name: "Venancio Pérez Gómez",
    role: "VP Ejecutivo · Samsung Electronics México · Manufactura",
    photo: photo("speaker-07-v3.jpg"),
  },
  {
    number: "02",
    name: "Sahíe Gazal Yunes",
    role: "Directora de Liderazgo, Cultura y Asuntos Públicos · Vocera Oficial · Audi México",
    photo: photo("speaker-sahie-gazal.jpg"),
  },
  {
    number: "03",
    name: "Ernesto Horta",
    role: "Socio Director · Grupo Enable Global · Estrategia Corporativa",
    photo: photo("speaker-05-v3.jpg"),
  },
  {
    number: "04",
    name: "María José Arévalo",
    role: "Directora Operativa · Restaurantes TOKS",
    photo: photo("speaker-01-v3.jpg"),
  },
  {
    number: "05",
    name: "Germán Sarmiento",
    role: "Director The Mars Society Colombia · European Space Foundation",
    photo: photo("speaker-02-v3.jpg"),
  },
  {
    number: "06",
    name: "Bety Camacho",
    role: "Presidenta · COPARMEX Puebla",
    photo: photo("speaker-bety-camacho.jpg"),
  },
  {
    number: "07",
    name: "Víctor Manuel Cota",
    role: "Presidente · CLAUZ · Competitividad industrial",
    photo: photo("speaker-victor-cota.jpg"),
  },
  {
    number: "08",
    name: "Leonardo Ramírez Sustaita",
    role: "Fundador y CEO · UDAAN",
    photo: photo("speaker-leonardo-ramirez.jpg"),
  },
  {
    number: "09",
    name: "Elias Israel Ríos Galindo",
    role: "Consultor en Comunicación · Voice Unlocked · UDAAN",
    photo: photo("speaker-03-v3.jpg"),
  },
  {
    number: "10",
    name: "Brandon Alonso Sustaita",
    role: "Maestro en Innovación · Hábitat 108",
    photo: photo("speaker-04-v3.jpg"),
  },
];
