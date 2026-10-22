import { describe, expect, it } from "vitest";
import { sectorCuts } from "./sector-cuts";

describe("cortes por sector", () => {
  it("agrupa aperturas y deja arriba el sector con más visitas", () => {
    const cuts = sectorCuts(
      [{ sectorSlug: "turismo" }, { sectorSlug: "turismo" }, { sectorSlug: "alimentos-y-bebidas" }],
      new Map([
        ["turismo", "Turismo"],
        ["alimentos-y-bebidas", "Alimentos y bebidas"],
      ]),
      new Map([["turismo", 1]]),
    );
    expect(cuts).toEqual([
      { slug: "turismo", name: "Turismo", opens: 2, conversions: 1, rate: 50 },
      { slug: "alimentos-y-bebidas", name: "Alimentos y bebidas", opens: 1, conversions: 0, rate: 0 },
    ]);
  });
});
