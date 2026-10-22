import type { Tablero } from "@/lib/admin/tablero/types";

export type Signal = { text: string; href: string; label: string };

function people(count: number, one: string, many: string) {
  return `${count.toLocaleString("es-MX")} ${count === 1 ? one : many}`;
}

export function convocatoriaSignals(board: Tablero): Signal[] {
  if (board.invitations === 0) {
    return [{ text: "Todavía no hay invitaciones cargadas.", href: "/admin/invitaciones", label: "Cargar invitaciones" }];
  }
  const items: Signal[] = [];
  if (board.pendingContact > 0) {
    items.push({
      text: `${people(board.pendingContact, "invitación sigue", "invitaciones siguen")} sin contactar.`,
      href: "/admin/correo",
      label: "Enviar correo",
    });
  }
  if (board.pendingConfirm > 0) {
    items.push({
      text: `${people(board.pendingConfirm, "contactado todavía no confirma", "contactados todavía no confirman")}.`,
      href: "/admin/crm",
      label: "Revisar CRM",
    });
  }
  if (board.pendingRegister > 0) {
    items.push({
      text: `${people(board.pendingRegister, "confirmó y no termina su registro", "confirmaron y no terminan su registro")}.`,
      href: "/admin/crm",
      label: "Revisar CRM",
    });
  }
  if (items.length === 0) {
    const text = board.declined > 0
      ? `${people(board.declined, "dijo", "dijeron")} que no. El resto de la lista ya avanzó.`
      : "No hay pendientes. La lista ya avanzó.";
    items.push({ text, href: "/admin/crm", label: "Ver CRM" });
  }
  return items.slice(0, 3);
}

export function lectura(board: Tablero) {
  if (board.invitations === 0) return "Carga la lista para ver cómo avanza la convocatoria.";
  const invites = people(board.invitations, "invitación", "invitaciones");
  if (board.confirmations === 0) return `De ${invites}, ninguna ha confirmado.`;
  const confirmed = people(board.confirmations, "ya confirmó", "ya confirmaron");
  return `De ${invites}, ${confirmed} (${board.rate}%).`;
}
