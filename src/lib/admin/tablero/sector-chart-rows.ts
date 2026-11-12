import type { OmittedSector, SectorFillRow } from "@/lib/admin/tablero/sector-fill";

export function sectorChartRows(rows: SectorFillRow[], outside: OmittedSector[]): SectorFillRow[] {
  return [...rows, ...outside.map(outsideRow)];
}

function outsideRow(item: OmittedSector): SectorFillRow {
  return {
    sector: item.sector,
    slug: item.slug,
    cupo: 0,
    ocupados: Math.max(0, item.personas - item.pendientes),
    pendientes: item.pendientes,
  };
}
