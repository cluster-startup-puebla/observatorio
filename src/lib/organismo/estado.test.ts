import { describe, expect, it } from "vitest";
import { orgEstado, orgEstadoLabel } from "./estado";

describe("cubetas del organismo", () => {
  it("agrupa los hechos sin renombrar la máquina", () => {
    expect(orgEstado("cargado")).toBe("pendiente");
    expect(orgEstado("contactado")).toBe("contactado");
    expect(orgEstado("confirmo")).toBe("confirmado");
    expect(orgEstado("registrado")).toBe("confirmado");
    expect(orgEstado("llego")).toBe("confirmado");
    expect(orgEstado("no")).toBeNull();
    expect(orgEstadoLabel("cargado")).toBe("Pendiente");
    expect(orgEstadoLabel("contactado")).toBe("Contactado");
    expect(orgEstadoLabel("confirmo")).toBe("Confirmado");
    expect(orgEstadoLabel("no")).toBe("No");
  });
});
