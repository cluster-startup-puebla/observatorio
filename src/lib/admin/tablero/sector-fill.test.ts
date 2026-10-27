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
    onboarded: true,
    role: "empresario",
    linkPending: false,
    externalPending: false,
    released: false,
    ...partial,
  };
}

describe("cupo por sector", () => {
  it("separa ocupados, pendientes y quien está fuera de la sesión", () => {
    const result = sectorFill(quotas, [
      seat({ sectorSlug: "turismo" }),
      seat({ sectorSlug: "turismo", linkPending: true }),
      seat({ sectorSlug: "turismo", externalPending: true }),
      seat({ sectorSlug: "alimentos" }),
      seat({ sectorSlug: "textil", sectorName: "Textil" }),
      seat({ sectorSlug: "turismo", onboarded: false }),
      seat({ sectorSlug: "turismo", role: "director" }),
    ]);
    expect(result.cupo).toBe(3);
    expect(result.ocupados).toBe(2);
    expect(result.pendientes).toBe(2);
    expect(result.fuera).toBe(1);
    expect(result.rows).toEqual([
      { sector: "Turismo", slug: "turismo", cupo: 2, ocupados: 1, pendientes: 2 },
      { sector: "Alimentos", slug: "alimentos", cupo: 1, ocupados: 1, pendientes: 0 },
    ]);
  });

  it("sin cupos el total es cero y nadie ocupa", () => {
    expect(sectorFill([], [seat({ sectorSlug: "turismo" })])).toEqual({
      cupo: 0,
      ocupados: 0,
      pendientes: 0,
      fuera: 1,
      rows: [],
    });
  });

  it("el tablero lee la sesión elegida o la vigente, los cupos y la aceptación", () => {
    const source = [
      readFileSync("src/lib/admin/tablero/load-cupos.ts", "utf8"),
      readFileSync("src/lib/admin/tablero/cupo-seat.ts", "utf8"),
    ].join("\n");
    expect(source).toContain('.eq("is_current", true)');
    expect(source).toContain("session_sector_quotas");
    expect(source).toContain("pendingLinkEmails");
    expect(source).toContain("waitsForExternalApproval");
    expect(source).toContain("sectorFill");
    expect(source).toContain("sessionId");
    expect(source).toContain("attendance_cancellations");
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
