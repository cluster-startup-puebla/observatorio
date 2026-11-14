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
    time: "09:20–09:40",
    name: "Estrategia de vinculación del ecosistema de innovación de Puebla",
    host: "Yamil Álvarez",
    mark: "/ponentes/yamil-alvarez.webp",
  },
  { time: "09:40–09:50", name: "Encuadre de ejercicio", host: "Roberto Márquez", faces: [null] },
  {
    time: "09:50–10:20",
    name: "Construcción del observatorio tecnológico por las empresas asistentes",
    host: "Participantes",
    icon: "users",
  },
  {
    time: "10:20–10:30",
    name: "Invitación a innovación abierta (casos de éxito)",
    host: "Clúster de Startups e Innovación",
    mark: "/logos/logo-cluster.webp",
  },
  {
    time: "10:30–10:50",
    name: "Panel: Economía Circular Puebla y Nuevo León",
    host: "Clúster de Plásticos y Economía Circular y Hub Mexicano de Economía Circular",
    faces: ["/logos/logo-cluster-plasticos.png", null],
  },
  {
    time: "10:50–11:20",
    name: "Ventajas de la adopción tecnológica para la industria poblana ante el T-MEC",
    host: "Fausto López",
    mark: "/ponentes/fausto-lopez-aguilar.webp",
  },
  {
    time: "11:20–11:30",
    name: "Cierre y conclusiones",
    host: "Yamil Álvarez",
    mark: "/ponentes/yamil-alvarez.webp",
  },
];
