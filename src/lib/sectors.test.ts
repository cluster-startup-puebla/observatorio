import { describe, expect, it } from "vitest";
import { reserveHref, resolveSector, sectorSlug, sectors } from "./sectors";

describe("sectors", () => {
  it("publica el catálogo con slug estable", () => {
    expect(sectors.map((sector) => sector.slug)).toContain("automotriz-y-autopartes");
    expect(sectorSlug("Textil y confección")).toBe("textil-y-confeccion");
  });

  it("una ruta conocida deja el sector seleccionado y bloqueado", () => {
    expect(resolveSector({ pathSector: "alimentos-y-bebidas" })).toEqual({
      slug: "alimentos-y-bebidas",
      name: "Alimentos y bebidas",
      locked: true,
    });
  });

  it("una ruta desconocida no inventa sector", () => {
    expect(resolveSector({ pathSector: "no-existe" })).toEqual({
      slug: null,
      name: null,
      locked: false,
    });
  });

  it("sin ruta, usa la elección si está en el catálogo", () => {
    expect(resolveSector({ chosen: "turismo" })).toEqual({
      slug: "turismo",
      name: "Turismo",
      locked: false,
    });
  });

  it("la ruta gana sobre la elección y el nombre en claro no es slug", () => {
    expect(resolveSector({ pathSector: "turismo", chosen: "logistica" })).toEqual({
      slug: "turismo",
      name: "Turismo",
      locked: true,
    });
    expect(resolveSector({ chosen: "Turismo" })).toEqual({
      slug: null,
      name: null,
      locked: false,
    });
    expect(resolveSector({})).toEqual({ slug: null, name: null, locked: false });
  });

  it("limpia acentos, mayúsculas y signos sin dejar guiones sueltos", () => {
    expect(sectorSlug("  Metalmecánica!!! ")).toBe("metalmecanica");
    expect(sectorSlug("Artes gráficas y empaque")).toBe("artes-graficas-y-empaque");
    expect(sectorSlug("---")).toBe("");
  });

  it("el enlace de reserva conserva el sector de la ruta", () => {
    expect(reserveHref("/automotriz-y-autopartes")).toBe(
      "/register?sector=automotriz-y-autopartes",
    );
    expect(reserveHref("/")).toBe("/register");
    expect(reserveHref("/sector-inventado")).toBe("/register");
  });
});
