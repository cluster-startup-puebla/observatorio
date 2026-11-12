export type Seat = {
  sectorSlug: string;
  sectorName: string;
  onboarded: boolean;
  role: string;
  linkPending: boolean;
  externalPending: boolean;
  released: boolean;
};

export type SectorQuota = { sectorSlug: string; sectorName: string; capacity: number };

export type SectorFillRow = {
  sector: string;
  slug: string;
  cupo: number;
  ocupados: number;
  pendientes: number;
};

export type OmittedSector = {
  sector: string;
  slug: string;
  personas: number;
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
  const omitted = new Map<string, OmittedSector>();
  let fuera = 0;
  for (const seat of seats) {
    if (seat.released) continue;
    if (!ready(seat)) continue;
    const row = bySlug.get(seat.sectorSlug);
    const waiting = seat.linkPending || seat.externalPending;
    if (!row) {
      const slug = seat.sectorSlug || "sin-sector";
      const current = omitted.get(slug) ?? {
        sector: seat.sectorName.trim() || "Sin sector",
        slug,
        personas: 0,
        pendientes: 0,
      };
      current.personas += 1;
      if (waiting) current.pendientes += 1;
      else fuera += 1;
      omitted.set(slug, current);
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
    omitidos: [...omitted.values()].sort(
      (a, b) => b.personas - a.personas || a.sector.localeCompare(b.sector, "es"),
    ),
    rows,
  };
}
