import { describe, expect, it } from "vitest";
import { linkConversions } from "./link-conversions";

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
});
