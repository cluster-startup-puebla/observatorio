import type { InviteRow, InviteRowError } from "@/lib/invite-sheet";

export function invitesFromEmails(text: string): { ok: InviteRow[]; errors: InviteRowError[] } {
  const ok: InviteRow[] = [];
  const errors: InviteRowError[] = [];
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((line, index) => {
    const correo = line.trim().toLowerCase();
    if (!correo) return;
    const row = index + 1;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errors.push({ row, reason: "correo inválido" });
      return;
    }
    if (seen.has(correo)) {
      errors.push({ row, reason: "correo repetido" });
      return;
    }
    seen.add(correo);
    const local = correo.split("@")[0] ?? correo;
    const nombre = local.charAt(0).toUpperCase() + local.slice(1);
    ok.push({ nombre, empresa: "Por confirmar", correo });
  });
  return { ok, errors };
}
