export type V2Band = "platino" | "oro" | "plata" | "bronce";

export interface V2LevelStep {
  band: V2Band;
  min: number;
  max: number | null;
  actions: string[];
}

export function bandFor(ismsNivel2: number): V2Band {
  if (ismsNivel2 >= 85) return "platino";
  if (ismsNivel2 >= 70) return "oro";
  if (ismsNivel2 >= 50) return "plata";
  return "bronce";
}

/** Sector sheet cuts. A score on the boundary belongs to the higher level. */
export function levelStepFor(score: number, steps: V2LevelStep[]): V2LevelStep | null {
  const ordered = [...steps].sort((a, b) => b.min - a.min);
  return ordered.find((step) => score >= step.min && (step.max === null || score < step.max)) ?? null;
}
