import { describe, expect, it } from "vitest";
import { brandBackground, isBrandHex, sidebarBrandStyle, sidebarInk } from "./brand-color";

describe("color de marca del sidebar", () => {
  it("acepta solo # y seis dígitos hex", () => {
    expect(isBrandHex("#dc0008")).toBe(true);
    expect(isBrandHex("#DC0008")).toBe(true);
    expect(isBrandHex(" #00133e ")).toBe(true);
    expect(isBrandHex("#fff")).toBe(false);
    expect(isBrandHex("#dc000")).toBe(false);
    expect(isBrandHex("#dc000080")).toBe(false);
    expect(isBrandHex("dc0008")).toBe(false);
    expect(isBrandHex("#gg0000")).toBe(false);
    expect(isBrandHex("")).toBe(false);
    expect(isBrandHex(null)).toBe(false);
  });

  it("elige tinta clara en fondos oscuros", () => {
    for (const hex of ["#dc0008", "#020041", "#00133e", "#16284F"]) {
      const tone = sidebarInk(hex);
      expect(tone.background.toLowerCase()).toBe(hex.toLowerCase());
      expect(tone.ink).toBe("#f5f6f8");
      expect(tone.darkBar).toBe(true);
    }
  });

  it("elige tinta oscura en amarillo claro y blanco", () => {
    for (const hex of ["#ffff00", "#ffffff", "#fff6a8"]) {
      const tone = sidebarInk(hex);
      expect(tone.ink).toBe("#16284f");
      expect(tone.darkBar).toBe(false);
    }
  });

  it("un hex inválido o vacío cae al marino con tinta clara", () => {
    for (const value of [null, undefined, "", "rojo", "#fff", "#12"]) {
      const tone = sidebarInk(value);
      expect(tone.background).toBe("#16284F");
      expect(brandBackground(value)).toBe("#16284F");
      expect(tone.ink).toBe("#f5f6f8");
    }
  });

  it("no pinta variables si el color no viene", () => {
    expect(sidebarBrandStyle(null)).toBeUndefined();
    expect(sidebarBrandStyle(undefined)).toBeUndefined();
    expect(sidebarBrandStyle("  ")).toBeUndefined();
  });

  it("un hex inválido presente usa el marino de respaldo", () => {
    const style = sidebarBrandStyle("rojo");
    expect(style).toMatchObject({
      "--sidebar": "#16284F",
      "--sidebar-foreground": "#f5f6f8",
      "--sidebar-accent": "rgb(255 255 255 / 12%)",
      "--sidebar-border": "rgb(255 255 255 / 16%)",
    });
  });

  it("una barra clara usa velo y borde oscuros", () => {
    const style = sidebarBrandStyle("#ffffff");
    expect(style).toMatchObject({
      "--sidebar": "#ffffff",
      "--sidebar-foreground": "#16284f",
      "--sidebar-accent": "rgb(22 40 79 / 8%)",
      "--sidebar-accent-foreground": "#16284f",
      "--sidebar-border": "rgb(22 40 79 / 16%)",
    });
  });
});
