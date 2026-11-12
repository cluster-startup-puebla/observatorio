export type PathPending = {
  id: string;
  nombre: string;
  empresa: string;
  sector: string;
};

type Owner = { full_name?: string | null; onboarded_at?: string | null; role?: string | null };

export type PathCompany = {
  id: string;
  legal_name: string | null;
  admitted_at: string | null;
  sectors: { name: string | null } | { name: string | null }[] | null;
  owner: Owner | Owner[] | null;
};

function one<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function pathPendingRows(rows: PathCompany[]): PathPending[] {
  return rows.flatMap((row) => {
    const owner = one(row.owner);
    if (!owner?.onboarded_at || owner.role !== "empresario" || row.admitted_at) return [];
    return [{
      id: row.id,
      nombre: owner.full_name?.trim() || "Sin nombre",
      empresa: row.legal_name?.trim() || "Sin empresa",
      sector: one(row.sectors)?.name?.trim() || "Sin sector",
    }];
  });
}
