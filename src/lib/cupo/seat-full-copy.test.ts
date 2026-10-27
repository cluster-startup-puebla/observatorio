import { describe, expect, it } from "vitest";
import { seatFullCopy } from "./seat-full-copy";

describe("aviso de cupo", () => {
  it("traduce sector_lleno y deja pasar el resto", () => {
    expect(seatFullCopy("sector_lleno")).toBe("Este sector ya está lleno. La persona sigue en espera.");
    expect(seatFullCopy("ERROR: sector_lleno")).toBe("Este sector ya está lleno. La persona sigue en espera.");
    expect(seatFullCopy("aceptar")).toBe("No se pudo aceptar.");
    expect(seatFullCopy(undefined)).toBe("");
  });
});
