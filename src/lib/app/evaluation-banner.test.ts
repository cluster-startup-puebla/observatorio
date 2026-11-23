import { describe, expect, it } from "vitest";
import { sectorHasPackFor, showFirstEvaluation } from "./evaluation-banner";

describe("showFirstEvaluation", () => {
  it("verificada, con paquete y sin evaluación terminada", () => {
    expect(showFirstEvaluation({ sectorHasPack: true, finished: false, verified: true })).toBe(true);
  });

  it("sin verificar no muestra evaluación", () => {
    expect(showFirstEvaluation({ sectorHasPack: true, finished: false, verified: false })).toBe(false);
  });

  it("con paquete y evaluación terminada", () => {
    expect(showFirstEvaluation({ sectorHasPack: true, finished: true, verified: true })).toBe(false);
  });

  it("sin paquete y sin evaluación terminada", () => {
    expect(showFirstEvaluation({ sectorHasPack: false, finished: false, verified: true })).toBe(false);
  });

  it("sin paquete y con evaluación terminada", () => {
    expect(showFirstEvaluation({ sectorHasPack: false, finished: true, verified: true })).toBe(false);
  });
});

describe("sectorHasPackFor", () => {
  it("es true cuando el instrumento no es none", () => {
    expect(sectorHasPackFor("plasticos-y-hule")).toBe(true);
    expect(sectorHasPackFor("textil-y-confeccion")).toBe(true);
    expect(sectorHasPackFor("turismo")).toBe(true);
  });

  it("es false cuando el instrumento es none", () => {
    expect(sectorHasPackFor("minerales-no-metalicos")).toBe(false);
    expect(sectorHasPackFor("desconocido")).toBe(false);
  });
});
