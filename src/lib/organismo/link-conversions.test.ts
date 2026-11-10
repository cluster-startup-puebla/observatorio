import { describe, expect, it } from "vitest";
import { conversionMoments, linkConversions } from "./link-conversions";

describe("conversiones del enlace", () => {
  it("no cuenta al pendiente ni al rechazo", () => {
    const map = linkConversions([
      { slug: "turismo", status: "cargado" },
      { slug: "turismo", status: "registrado" },
      { slug: "turismo", status: "no" },
      { slug: "alimentos-y-bebidas", status: "llego" },
    ]);
    expect(map.get("turismo")).toBe(1);
    expect(map.get("alimentos-y-bebidas")).toBe(1);
    expect([...map.values()].reduce((sum, count) => sum + count, 0)).toBe(2);
  });

  it("la gráfica solo recibe conversiones aceptadas con fecha", () => {
    const moments = conversionMoments([
      { slug: "turismo", status: "registrado", at: "2026-10-22T17:00:00.000Z" },
      { slug: "turismo", status: "cargado", at: "2026-10-22T18:00:00.000Z" },
      { slug: "", status: "llego", at: "2026-10-22T18:00:00.000Z" },
    ]);
    expect(moments).toEqual([{ slug: "turismo", status: "registrado", at: "2026-10-22T17:00:00.000Z" }]);
  });
});
