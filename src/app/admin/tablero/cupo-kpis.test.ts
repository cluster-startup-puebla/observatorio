import { describe, expect, it } from "vitest";
import { registeredTotal } from "./cupo-kpis";

describe("registeredTotal", () => {
  it("suma ocupados, pendientes y quienes llegaron fuera de la lista", () => {
    expect(
      registeredTotal({
        cupo: 121,
        ocupados: 52,
        pendientes: 2,
        omitidos: [{ personas: 11 }, { personas: 3 }],
      }),
    ).toBe(68);
  });
});
