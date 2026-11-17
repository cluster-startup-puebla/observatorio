export type AdminSegment = "module" | "sector" | "missing";

export function adminSegment(slug: string, moduleKeys: readonly string[], sectorExists: boolean): AdminSegment {
  if (moduleKeys.includes(slug)) return "module";
  if (sectorExists) return "sector";
  return "missing";
}
