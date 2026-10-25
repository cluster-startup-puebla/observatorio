export const sectorSources = [
  { value: "chosen", label: "Lo eligió la persona" },
  { value: "path", label: "Lugar desconocido" },
  { value: "link", label: "Por el enlace del organismo" },
] as const;

export type SectorSource = (typeof sectorSources)[number]["value"];

export function sectorSourceLabel(value: string) {
  return sectorSources.find((item) => item.value === value)?.label ?? "";
}

export function parseSectorSource(value: string): SectorSource | null {
  const match = sectorSources.find((item) => item.value === value);
  return match ? match.value : null;
}
