import { describe, expect, it } from "vitest";
import { buildTablero } from "@/lib/admin/tablero/snapshot";
import { convocatoriaSignals } from "@/lib/admin/tablero/reading";

const orgs = [
  { id: "o1", name: "Norte" },
  { id: "o2", name: "Sur" },
];

describe("tablero de la convocatoria", () => {
  it("separa el enlace pendiente del aceptado", () => {
    const board = buildTablero({
      contacts: [
        { id: "p", source: "enlace", organizationId: "o1" },
        { id: "a", source: "enlace", organizationId: "o1" },
        { id: "n", source: "enlace", organizationId: "o1" },
      ],
      statuses: [
        { contactId: "p", status: "cargado" },
        { contactId: "a", status: "registrado" },
        { contactId: "n", status: "no" },
      ],
      orgs,
      confirmations: [],
    });
    expect(board.linkSignups).toBe(3);
    expect(board.linkPending).toBe(1);
    expect(board.linkAccepted).toBe(1);
    expect(board.invitations).toBe(0);
    expect(board.byOrg).toEqual([]);
    expect(board.byLinkOrg).toEqual([{ organismo: "Norte", enlaces: 3, pendientes: 1 }]);
  });

  it("sin lista pide cargar y un rechazo cierra el pendiente", () => {
    const empty = buildTablero({ contacts: [], statuses: [], orgs: [], confirmations: [] });
    expect(empty.rate).toBe(0);
    expect(convocatoriaSignals(empty)[0]?.href).toBe("/admin/invitaciones");
    const missing = buildTablero({
      contacts: [{ id: "a", source: "manual", organizationId: "o1" }],
      statuses: [],
      orgs,
      confirmations: [],
    });
    expect(missing.pendingContact).toBe(1);
    const closed = buildTablero({
      contacts: [{ id: "a", source: "excel", organizationId: "o1" }],
      statuses: [{ contactId: "a", status: "no" }],
      orgs,
      confirmations: [],
    });
    expect(closed.confirmations).toBe(0);
    expect(convocatoriaSignals(closed)[0]?.text).toBe("1 dijo que no. El resto de la lista ya avanzó.");
  });
});
