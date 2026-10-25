import { describe, expect, it } from "vitest";
import { externalApprovalLabel, waitsForExternalApproval } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";

describe("registro externo", () => {
  it("path se lee como lugar desconocido", () => {
    expect(sectorSourceLabel("path")).toBe("Lugar desconocido");
    expect(sectorSourceLabel("link")).toBe("Por el enlace del organismo");
    expect(sectorSourceLabel("chosen")).toBe("Lo eligió la persona");
  });

  it("solo path sin fecha de aceptación espera al superadmin", () => {
    expect(waitsForExternalApproval("path", null)).toBe(true);
    expect(waitsForExternalApproval("path", "2026-10-24T00:00:00Z")).toBe(false);
    expect(waitsForExternalApproval("link", null)).toBe(false);
    expect(waitsForExternalApproval("chosen", null)).toBe(false);
  });

  it("la ficha distingue pendiente, aceptada y lo que no aplica", () => {
    expect(externalApprovalLabel("path", null)).toBe("Pendiente");
    expect(externalApprovalLabel("path", "2026-10-24T00:00:00Z")).toBe("Aceptada");
    expect(externalApprovalLabel("link", null)).toBe("No aplica");
  });
});
