import { describe, expect, it } from "vitest";
import { contrastRatio } from "./brand-color";
import { logoNeedsMonochromeInk, type Rgba } from "./logo-tone";

function solid(r: number, g: number, b: number, n = 40, a = 255): Rgba[] {
  return Array.from({ length: n }, () => ({ r, g, b, a }));
}

describe("logo de un tono sobre la marca", () => {
  it("pinta un negro de poco contraste", () => {
    expect(contrastRatio("#000000", "#020041")).toBeLessThan(3);
    expect(logoNeedsMonochromeInk(solid(0, 0, 0), "#020041")).toBe(true);
    expect(logoNeedsMonochromeInk(solid(8, 8, 10), "#00133e")).toBe(true);
  });

  it("deja un negro que ya contrasta", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeGreaterThan(3);
    expect(logoNeedsMonochromeInk(solid(0, 0, 0), "#ffffff")).toBe(false);
    expect(contrastRatio("#000000", "#dc0008")).toBeGreaterThan(3);
    expect(logoNeedsMonochromeInk(solid(0, 0, 0), "#dc0008")).toBe(false);
  });

  it("pinta un blanco sobre fondo claro", () => {
    expect(logoNeedsMonochromeInk(solid(255, 255, 255), "#ffffff")).toBe(true);
    expect(logoNeedsMonochromeInk(solid(250, 248, 240), "#ffff00")).toBe(true);
  });

  it("no pinta un logo a color", () => {
    const crest = [
      ...solid(220, 0, 8, 20),
      ...solid(0, 140, 60, 20),
      ...solid(20, 40, 180, 20),
      ...solid(240, 200, 40, 20),
    ];
    expect(logoNeedsMonochromeInk(crest, "#020041")).toBe(false);
    expect(logoNeedsMonochromeInk(solid(220, 0, 8), "#00133e")).toBe(false);
  });

  it("no aplana un emblema en blanco y negro", () => {
    const mark = [...solid(0, 0, 0, 30), ...solid(255, 255, 255, 30)];
    expect(logoNeedsMonochromeInk(mark, "#00133e")).toBe(false);
  });

  it("ignora pixeles transparentes y archivos vacíos", () => {
    const ghost = [...solid(220, 0, 8, 30, 0), ...solid(0, 0, 0, 20)];
    expect(logoNeedsMonochromeInk(ghost, "#020041")).toBe(true);
    expect(logoNeedsMonochromeInk([], "#020041")).toBe(false);
    expect(logoNeedsMonochromeInk(solid(0, 0, 0, 10, 0), "#020041")).toBe(false);
  });
});
