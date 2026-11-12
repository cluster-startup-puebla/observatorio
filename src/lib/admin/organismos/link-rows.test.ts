import { describe, expect, it } from "vitest";
import { linkRow } from "./link-rows";

describe("fila de enlace", () => {
  it("arma la ruta del sector y deja la fecha legible", () => {
    const row = linkRow({
      id: "c1",
      createdAt: "2026-11-10T18:00:00.000Z",
      sectorName: "Turismo",
      sectorSlug: "turismo",
      sessionLabel: "Quinta Real · 12 nov",
      token: "abc",
      sessionId: "sesion-1",
    });
    expect(row.sector).toBe("Turismo");
    expect(row.session).toBe("Quinta Real · 12 nov");
    expect(row.path).toBe("/turismo?abc&sesion=sesion-1");
    expect(row.created).toBe("10 nov 2026");
  });
});
