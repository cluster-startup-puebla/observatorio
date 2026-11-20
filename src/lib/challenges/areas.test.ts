import { describe, expect, it } from "vitest";
import { CHALLENGE_AREAS, areaLabel, isChallengeArea } from "./areas";

describe("challenge areas", () => {
  it("has the closed catalog", () => {
    expect(CHALLENGE_AREAS).toEqual([
      "rrhh",
      "finanzas",
      "contabilidad",
      "almacen",
      "produccion",
      "compras",
      "ventas",
      "logistica",
      "ti",
      "calidad",
      "otro",
    ]);
  });

  it("labels and guards", () => {
    expect(areaLabel("ti")).toBe("TI");
    expect(areaLabel("rrhh")).toBe("RRHH");
    expect(isChallengeArea("ventas")).toBe(true);
    expect(isChallengeArea("marketing")).toBe(false);
  });
});
