export type Seat = {
  sectorSlug: string;
  sectorName: string;
  onboarded: boolean;
  role: string;
  linkPending: boolean;
  externalPending: boolean;
};

export type SectorQuota = { sectorSlug: string; sectorName: string; capacity: number };

export type SectorFillRow = {
  sector: string;
  slug: string;
  cupo: number;
  ocupados: number;
  pendientes: number;
};

function ready(seat: Seat) {
  return seat.onboarded && seat.role === "empresario";
}

export function sectorFill(quotas: SectorQuota[], seats: Seat[]) {
  const rows = quotas.map((quota) => ({
    sector: quota.sectorName,
    slug: quota.sectorSlug,
    cupo: quota.capacity,
    ocupados: 0,
    pendientes: 0,
  }));
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  let fuera = 0;
  for (const seat of seats) {
    if (!ready(seat)) continue;
    const row = bySlug.get(seat.sectorSlug);
    const waiting = seat.linkPending || seat.externalPending;
    if (!row) {
      if (!waiting) fuera += 1;
      continue;
    }
    if (waiting) row.pendientes += 1;
    else row.ocupados += 1;
  }
  return {
    cupo: rows.reduce((sum, row) => sum + row.cupo, 0),
    ocupados: rows.reduce((sum, row) => sum + row.ocupados, 0),
    pendientes: rows.reduce((sum, row) => sum + row.pendientes, 0),
    fuera,
    rows,
  };
}
