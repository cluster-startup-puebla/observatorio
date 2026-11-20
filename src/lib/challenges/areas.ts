export const CHALLENGE_AREAS = [
  "rrhh",
  "finanzas",
  "contabilidad",
  "almacen",
  "produccion",
  "compras",
  "ventas",
  "logistica",
  "ti",
  "calidad",
  "otro",
] as const;

export type ChallengeArea = (typeof CHALLENGE_AREAS)[number];

const labels: Record<ChallengeArea, string> = {
  rrhh: "RRHH",
  finanzas: "Finanzas",
  contabilidad: "Contabilidad",
  almacen: "Almacén",
  produccion: "Producción",
  compras: "Compras",
  ventas: "Ventas",
  logistica: "Logística",
  ti: "TI",
  calidad: "Calidad",
  otro: "Otro",
};

export function isChallengeArea(value: string): value is ChallengeArea {
  return (CHALLENGE_AREAS as readonly string[]).includes(value);
}

export function areaLabel(area: ChallengeArea) {
  return labels[area];
}
