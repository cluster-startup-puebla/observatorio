export const ANSWER_POINTS = { a: 1, b: 2, c: 4, d: 6 } as const;

export const PRIORITY_SEVERITY = {
  falta_materiales: 6,
  fallas_mecanicas: 4,
  personal: 2,
  set_ups_lentos: 1,
} as const;

export type Level = "Bronce" | "Plata" | "Oro";

export type RangeBand = { min: number; max: number; category: Level };

const low: RangeBand[] = [
  { min: 4, max: 10, category: "Bronce" },
  { min: 11, max: 18, category: "Plata" },
  { min: 19, max: 24, category: "Oro" },
];

const high: RangeBand[] = [
  { min: 5, max: 12, category: "Bronce" },
  { min: 13, max: 22, category: "Plata" },
  { min: 23, max: 30, category: "Oro" },
];

export const SECTION_RANGES: Record<string, RangeBand[]> = {
  infraestructura: high,
  equipo_productivo: low,
  financiera: low,
  operacion: high,
};

export const INTEGRAL_RANGES: RangeBand[] = [
  { min: 18, max: 53, category: "Bronce" },
  { min: 54, max: 89, category: "Plata" },
  { min: 90, max: 108, category: "Oro" },
];

type Profile = { riesgo: string; reto: string };

const bronze = {
  riesgo: "La operación depende de registros sueltos y de la persona que los recuerda.",
  reto: "Dejar un registro mínimo que otra persona pueda retomar.",
};
const silver = {
  riesgo: "Hay método, pero se corta cuando cambia el turno o el proveedor.",
  reto: "Volver repetible lo que ya funciona en los mejores días.",
};
const gold = {
  riesgo: "El riesgo principal es dejar de medir lo que ya está estable.",
  reto: "Sostener el nivel y compartir la práctica con el sector.",
};

function profiles(): Record<Level, Profile> {
  return { Bronce: bronze, Plata: silver, Oro: gold };
}

export const SECTION_PROFILES: Record<string, Record<Level, Profile>> = {
  infraestructura: profiles(),
  equipo_productivo: profiles(),
  financiera: profiles(),
  operacion: profiles(),
};

export const INTEGRAL_PROFILES: Record<Level, Profile> = profiles();

const choices = [
  { value: "a", label: "Casi no ocurre" },
  { value: "b", label: "A veces" },
  { value: "c", label: "Casi siempre" },
  { value: "d", label: "Siempre, y queda registro" },
];

const recordChoices = [
  { value: "a", label: "Papel/Bitácoras" },
  { value: "b", label: "Hojas de cálculo sueltas" },
  { value: "c", label: "Un sistema, sin cruce entre áreas" },
  { value: "d", label: "Un sistema compartido y al día" },
];

export type Question = {
  id: number;
  type: "single" | "priority";
  text: string;
  options: { value: string; label: string }[];
};

export type Section = {
  id: string;
  name: string;
  questions: Question[];
};

function single(id: number, text: string, options = choices): Question {
  return { id, type: "single", text, options };
}

export const SECTIONS: Section[] = [
  {
    id: "infraestructura",
    name: "Infraestructura y digitalización",
    questions: [
      single(1, "¿Dónde vive hoy el registro de la operación?", recordChoices),
      single(2, "¿La información de producción se puede consultar sin pedirla a una persona?"),
      single(3, "¿Los equipos críticos tienen un identificador y un responsable?"),
      single(4, "¿Hay respaldo de la información que no cabe perder?"),
      single(5, "¿El piso y la oficina ven los mismos números?"),
    ],
  },
  {
    id: "equipo_productivo",
    name: "Situación del equipo productivo",
    questions: [
      single(6, "¿El equipo principal trabaja dentro de su capacidad real?"),
      single(7, "¿El mantenimiento se hace antes de que el equipo falle?"),
      single(8, "¿Hay refacciones críticas sin depender de un solo proveedor?"),
      single(9, "¿Se mide la disponibilidad del equipo, no solo si arrancó?"),
    ],
  },
  {
    id: "financiera",
    name: "Gestión financiera y costos",
    questions: [
      single(10, "¿El costo del producto se recalcula cuando cambian los insumos?"),
      single(11, "¿Se distingue el gasto de operar del gasto de crecer?"),
      single(12, "¿La cobranza tiene fecha y responsable?"),
      single(13, "¿Una decisión de precio se puede explicar con números propios?"),
    ],
  },
  {
    id: "operacion",
    name: "Operación, paros y calidad",
    questions: [
      single(14, "¿Un paro queda registrado con causa y duración?"),
      single(15, "¿La calidad se revisa antes de que el cliente la encuentre?"),
      single(16, "¿El cambio de producto tiene un método, no solo prisa?"),
      single(17, "¿El retrabajo se cuenta aparte de la producción buena?"),
      {
        id: 18,
        type: "priority",
        text: "Ordena la causa que más te frena hoy. El 1 es la más grave.",
        options: [
          { value: "falta_materiales", label: "Falta de materiales" },
          { value: "fallas_mecanicas", label: "Fallas mecánicas" },
          { value: "personal", label: "Personal" },
          { value: "set_ups_lentos", label: "Set ups lentos" },
        ],
      },
    ],
  },
];
