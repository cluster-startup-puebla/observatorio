import { describe, expect, it } from "vitest";
import { foldLinks } from "./fold-links";
import { linkRow } from "./link-rows";

describe("fila de enlace", () => {
  it("arma la ruta del sector y deja la fecha legible", () => {
    const row = linkRow({
      id: "c1",
      createdAt: "2026-11-10T18:00:00.000Z",
      sectorId: "sec-turismo",
      sectorName: "Turismo",
      sectorSlug: "turismo",
      sessionLabel: "Quinta Real · 12 nov",
      token: "abc",
      sessionId: "sesion-1",
    });
    expect(row.sector).toBe("Turismo");
    expect(row.session).toBe("Quinta Real · 12 nov");
    expect(row.path).toBe("/turismo?abc&sesion=sesion-1");
    expect(row.created).toBe("10 nov 2026 · 12:00");
  });

  it("junta copias del mismo enlace y conserva cada fecha", () => {
    const shared = {
      sectorId: "sec-agro",
      sectorName: "Agronomía",
      sectorSlug: "agroindustria",
      sessionLabel: "Quinta Real · 12 nov",
      token: "abc",
      sessionId: "sesion-1",
    };
    const [row] = foldLinks([
      linkRow({ ...shared, id: "nuevo", createdAt: "2026-11-10T21:59:00.000Z" }),
      linkRow({ ...shared, id: "viejo", createdAt: "2026-11-05T23:24:00.000Z" }),
    ]);
    expect(row?.times).toBe(2);
    expect(row?.path).toBe("/agroindustria?abc&sesion=sesion-1");
    expect(row?.dates).toEqual(["10 nov 2026 · 15:59", "5 nov 2026 · 17:24"]);
  });
});
