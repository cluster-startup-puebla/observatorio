import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { attendingCompanies, type AttendingInput } from "./attending";

const rows: AttendingInput[] = [
  { id: "c1", legalName: "Norte", sectorSlug: "turismo", sectorName: "Turismo", showLogo: true, onboarded: true, role: "empresario" },
  { id: "c2", legalName: "Sur", sectorSlug: "textil-y-confeccion", sectorName: "Textil", showLogo: false, onboarded: true, role: "empresario" },
  { id: "c3", legalName: "Staff", sectorSlug: "turismo", sectorName: "Turismo", showLogo: false, onboarded: false, role: "director" },
];

describe("empresas que asistirán", () => {
  it("en general trae a quien terminó el perfil", () => {
    const result = attendingCompanies(rows, null);
    expect(result.sector).toBeNull();
    expect(result.rows.map((row) => row.id)).toEqual(["c1", "c2"]);
  });

  it("filtra por sector y solo el check trae logo", () => {
    const result = attendingCompanies(rows, " turismo ");
    expect(result.sector).toBe("turismo");
    expect(result.rows).toEqual([
      {
        id: "c1",
        legalName: "Norte",
        sectorSlug: "turismo",
        sectorName: "Turismo",
        showLogo: true,
        logoUrl: "/api/admin/empresas/c1/logo",
      },
    ]);
  });

  it("empresas y la sesión consultan la misma lista", () => {
    const empresas = readFileSync("src/app/api/admin/empresas/route.ts", "utf8");
    const sesion = readFileSync("src/app/api/admin/sesiones/[id]/route.ts", "utf8");
    expect(empresas).toContain('get("vista") === "asistentes"');
    expect(empresas).toContain("loadAttending");
    expect(sesion).toContain("loadAttending");
  });
});
