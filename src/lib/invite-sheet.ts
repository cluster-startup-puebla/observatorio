export type InviteRow = { nombre: string; empresa: string; correo: string };
export type InviteRowError = { row: number; reason: string };

const header = ["nombre", "empresa", "correo"];

export function inviteTemplateCsv(): string {
  return `${header.join(",")}\n`;
}

export function parseInviteSheet(rows: string[][]): { ok: InviteRow[]; errors: InviteRowError[] } {
  const head = (rows[0] ?? []).map((cell) => cell.trim().toLowerCase());
  if (head.join(",") !== header.join(",")) {
    return { ok: [], errors: [{ row: 1, reason: "el encabezado debe ser nombre, empresa, correo" }] };
  }
  const ok: InviteRow[] = [];
  const errors: InviteRowError[] = [];
  const seen = new Set<string>();
  rows.slice(1).forEach((cells, index) => {
    const row = index + 2;
    const nombre = cells[0]?.trim() ?? "";
    const empresa = cells[1]?.trim() ?? "";
    const correo = (cells[2]?.trim() ?? "").toLowerCase();
    if (!nombre || !empresa || !correo) {
      errors.push({ row, reason: "nombre, empresa y correo son obligatorios" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errors.push({ row, reason: "correo inválido" });
      return;
    }
    if (seen.has(correo)) {
      errors.push({ row, reason: "correo repetido" });
      return;
    }
    seen.add(correo);
    ok.push({ nombre, empresa, correo });
  });
  return { ok, errors };
}
