import type { V2LevelStep } from "./bands";
import type { V2Question } from "./types";

export type LoadedSector = {
  questions: V2Question[];
  roadmap: V2LevelStep[];
};

const files = {
  "agricola-pecuaria": () => import("@/content/methodology/v2/n2/agricola-pecuaria.json"),
  alimentos: () => import("@/content/methodology/v2/n2/alimentos.json"),
  agencias: () => import("@/content/methodology/v2/n2/agencias.json"),
  "artes-graficas": () => import("@/content/methodology/v2/n2/artes-graficas.json"),
  automotriz: () => import("@/content/methodology/v2/n2/automotriz.json"),
  confeccion: () => import("@/content/methodology/v2/n2/confeccion.json"),
  construccion: () => import("@/content/methodology/v2/n2/construccion.json"),
  dispositivos: () => import("@/content/methodology/v2/n2/dispositivos.json"),
  gastronomia: () => import("@/content/methodology/v2/n2/gastronomia.json"),
  logistica: () => import("@/content/methodology/v2/n2/logistica.json"),
  "medico-hospitalario": () => import("@/content/methodology/v2/n2/medico-hospitalario.json"),
  metalmecanica: () => import("@/content/methodology/v2/n2/metalmecanica.json"),
  muebles: () => import("@/content/methodology/v2/n2/muebles.json"),
  plasticos: () => import("@/content/methodology/v2/n2/plasticos.json"),
  textiles: () => import("@/content/methodology/v2/n2/textiles.json"),
  turismo: () => import("@/content/methodology/v2/n2/turismo.json"),
  quimica: () => import("@/content/methodology/v2/n2/quimica.json"),
  tics: () => import("@/content/methodology/v2/n2/tics.json"),
  inmobiliario: () => import("@/content/methodology/v2/n2/inmobiliario.json"),
  sofom: () => import("@/content/methodology/v2/n2/sofom.json"),
  educacion: () => import("@/content/methodology/v2/n2/educacion.json"),
};

type SectorModule = {
  questions?: V2Question[];
  roadmap?: V2LevelStep[];
  default?: { questions: V2Question[]; roadmap: V2LevelStep[] };
};

export async function loadSector(id: string): Promise<LoadedSector | null> {
  const load = files[id as keyof typeof files] as (() => Promise<SectorModule>) | undefined;
  if (!load) return null;
  const mod = await load();
  const file = mod.questions && mod.roadmap ? mod : mod.default;
  if (!file?.questions || !file.roadmap) return null;
  return { questions: file.questions, roadmap: file.roadmap };
}
