import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sectorFill, type Seat } from "./sector-fill";

const quotas = [
  { sectorSlug: "turismo", sectorName: "Turismo", capacity: 2 },
  { sectorSlug: "alimentos", sectorName: "Alimentos", capacity: 1 },
];

function seat(partial: Partial<Seat> & Pick<Seat, "sectorSlug">): Seat {
  return {
    sectorName: partial.sectorSlug,
    status: "confirmed",
    released: false,
    ...partial,
  };
}

describe("cupo por sector", () => {
  it("separa ocupados, pendientes y quien está fuera de la sesión", () => {
    const result = sectorFill(quotas, [
      seat({ sectorSlug: "turismo" }),
      seat({ sectorSlug: "turismo", status: "pending" }),
      seat({ sectorSlug: "alimentos" }),
      seat({ sectorSlug: "textil", sectorName: "Textil" }),
      seat({ sectorSlug: "turismo", released: true }),
    ]);
    expect(result.cupo).toBe(3);
    expect(result.ocupados).toBe(2);
    expect(result.pendientes).toBe(1);
    expect(result.fuera).toBe(1);
    expect(result.omitidos).toEqual([{ sector: "Textil", slug: "textil", personas: 1, pendientes: 0 }]);
    expect(result.rows).toEqual([
      { sector: "Turismo", slug: "turismo", cupo: 2, ocupados: 1, pendientes: 1 },
      { sector: "Alimentos", slug: "alimentos", cupo: 1, ocupados: 1, pendientes: 0 },
    ]);
  });

  it("sin cupos el total es cero y nadie ocupa", () => {
    expect(sectorFill([], [seat({ sectorSlug: "turismo" })])).toEqual({
      cupo: 0,
      ocupados: 0,
      pendientes: 0,
      fuera: 1,
      omitidos: [{ sector: "turismo", slug: "turismo", personas: 1, pendientes: 0 }],
      rows: [],
    });
  });

  it("el tablero lee RSVPs de la sesión elegida", () => {
    const source = [
      readFileSync("src/lib/admin/tablero/load-cupos.ts", "utf8"),
      readFileSync("src/lib/admin/tablero/cupos-session-data.ts", "utf8"),
      readFileSync("src/lib/admin/tablero/rsvp-seat.ts", "utf8"),
    ].join("\n");
    expect(source).toContain("session_rsvps");
    expect(source).toContain("session_sector_quotas");
    expect(source).toContain("sectorFill");
    expect(source).toContain("sessionId");
    expect(source).toContain("toRsvpSeat");
  });

  it("cuenta a quien espera en un sector que no se convocó", () => {
    const result = sectorFill(quotas, [
      seat({ sectorSlug: "textil", sectorName: "Textil", status: "pending" }),
      seat({ sectorSlug: "textil", sectorName: "Textil" }),
    ]);
    expect(result.fuera).toBe(1);
    expect(result.ocupados).toBe(0);
    expect(result.omitidos).toEqual([{ sector: "Textil", slug: "textil", personas: 2, pendientes: 1 }]);
  });

  it("quien canceló deja de ocupar", () => {
    const result = sectorFill(quotas, [
      seat({ sectorSlug: "turismo" }),
      seat({ sectorSlug: "turismo", released: true }),
    ]);
    expect(result.ocupados).toBe(1);
    expect(result.rows[0]?.ocupados).toBe(1);
    expect(result.rows[0]?.pendientes).toBe(0);
  });
});