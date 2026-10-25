import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildTablero } from "@/lib/admin/tablero/snapshot";
import { convocatoriaSignals, cupoSignals, lectura } from "@/lib/admin/tablero/reading";

const orgs = [
  { id: "o1", name: "Norte" },
  { id: "o2", name: "Sur" },
];

describe("tablero de la convocatoria", () => {
  it("cuenta invitaciones y confirmaciones sin mezclar el enlace", () => {
    const board = buildTablero({
      contacts: [
        { id: "a", source: "excel", organizationId: "o1" },
        { id: "b", source: "manual", organizationId: "o1" },
        { id: "c", source: "excel", organizationId: "o2" },
        { id: "d", source: "enlace", organizationId: "o2" },
      ],
      statuses: [
        { contactId: "a", status: "cargado" },
        { contactId: "b", status: "confirmo" },
        { contactId: "c", status: "llego" },
        { contactId: "d", status: "registrado" },
      ],
      orgs,
      confirmations: [
        { contactId: "b", occurredAt: "2026-10-22T18:00:00.000Z" },
        { contactId: "c", occurredAt: "2026-10-21T18:00:00.000Z" },
        { contactId: "d", occurredAt: "2026-10-22T18:00:00.000Z" },
      ],
      now: new Date("2026-10-22T18:00:00.000Z"),
    });
    expect(board.invitations).toBe(3);
    expect(board.confirmations).toBe(2);
    expect(board.linkSignups).toBe(1);
    expect(board.linkAccepted).toBe(1);
    expect(board.linkPending).toBe(0);
    expect(board.rate).toBe(67);
    expect(board.pendingContact).toBe(1);
    expect(board.pendingRegister).toBe(1);
    expect(board.byOrg).toEqual([
      { organismo: "Norte", invitaciones: 2, confirmaciones: 1 },
      { organismo: "Sur", invitaciones: 1, confirmaciones: 1 },
    ]);
    expect(board.pace).toHaveLength(14);
    expect(board.pace.at(-1)?.confirmaciones).toBe(1);
    expect(board.pace.at(-2)?.confirmaciones).toBe(1);
    expect(lectura(board)).toBe("De 3 invitaciones, 2 ya confirmaron (67%).");
    expect(convocatoriaSignals(board).map((item) => item.label)).toEqual(["Enviar correo", "Revisar CRM"]);
  });

  it("lee el CRM y no escribe", () => {
    const source = readFileSync("src/lib/admin/tablero/load.ts", "utf8");
    expect(source).toContain('.from("crm_contacts")');
    expect(source).toContain('.from("crm_contact_status")');
    expect(source).toContain('.from("crm_events")');
    expect(source).toContain('"confirmar"');
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".insert(");
  });

  it("avisa el sector que ya llegó a su cupo", () => {
    const items = cupoSignals([
      { sector: "Turismo", slug: "turismo", cupo: 2, ocupados: 2, pendientes: 1 },
      { sector: "Alimentos", slug: "alimentos", cupo: 4, ocupados: 1, pendientes: 0 },
    ]);
    expect(items).toEqual([
      { text: "Turismo ya llenó su cupo (2 de 2).", href: "/admin/sesiones", label: "Ver sesión" },
    ]);
  });
});
