export type QuotaRow = { sectorId: string; capacity: number };

export function quotaDraft(form: FormData, sectorIds: string[], capacityMin: number) {
  const allowed = new Set(sectorIds);
  const rows: QuotaRow[] = [];
  for (const [key, raw] of form.entries()) {
    if (!key.startsWith("quota.")) continue;
    const sectorId = key.slice("quota.".length);
    if (!allowed.has(sectorId)) return { ok: false as const, reason: "sector inválido" };
    const text = String(raw).trim();
    if (!text) continue;
    const capacity = Number(text);
    if (!Number.isInteger(capacity) || capacity < 0) {
      return { ok: false as const, reason: "cupo inválido" };
    }
    if (capacity === 0) continue;
    rows.push({ sectorId, capacity });
  }
  const total = rows.reduce((sum, row) => sum + row.capacity, 0);
  if (total > 0 && total < capacityMin) {
    return { ok: false as const, reason: "el total de invitados es menor al cupo mínimo" };
  }
  return { ok: true as const, rows, total };
}
