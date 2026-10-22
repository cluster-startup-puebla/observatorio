import { parseInviteSheet } from "@/lib/invite-sheet";

export function csvRows(text: string) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export function invitesFromSheet(rows: string[][], organizationId: string) {
  const parsed = parseInviteSheet(rows);
  return {
    errors: parsed.errors,
    contacts: parsed.ok.map((row) => ({
      organization_id: organizationId,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.correo,
      source: "excel" as const,
      event: "cargar" as const,
    })),
  };
}

export function inviteSave(hasContact: boolean) {
  return hasContact ? "update" : "insert";
}
