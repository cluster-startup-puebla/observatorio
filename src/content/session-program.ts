export type ProgramSlot = {
  time: string;
  name: string;
  host: string;
  mark?: string;
  icon?: "qr" | "mic" | "users";
  faces?: (string | null)[];
};

export const program: ProgramSlot[] = [
  { time: "08:30–09:00", name: "Registro y recepción", host: "", icon: "qr" },
  { time: "09:00–09:20", name: "Acto protocolario", host: "", icon: "mic" },
  {
    time: "09:20–09:50",
    name: "Estrategia de vinculación del ecosistema de innovación de Puebla",
    host: "Clúster de Startups e Innovación",
    mark: "/logos/logo-cluster.webp",
  },
  {
    time: "09:50–10:30",
    name: "Construcción del observatorio tecnológico por las empresas asistentes",
    host: "Participantes",
    icon: "users",
  },
  {
    time: "10:30–11:00",
    name: "Panel: Economía Circular Puebla y Nuevo León",
    host: "Clúster de Plásticos y Economía Circular y Pro Planet",
    faces: ["/logos/logo-cluster-plasticos.png", "/logos/logo-pro-planet.png"],
  },
  {
    time: "11:00–11:30",
    name: "Ventajas de la adopción tecnológica para la industria poblana ante el T-MEC",
    host: "Fausto López",
    mark: "/ponentes/fausto-lopez-aguilar.webp",
  },
  {
    time: "11:30–11:35",
    name: "Cierre y conclusiones",
    host: "Yamil Álvarez",
    mark: "/ponentes/yamil-alvarez.webp",
  },
];
