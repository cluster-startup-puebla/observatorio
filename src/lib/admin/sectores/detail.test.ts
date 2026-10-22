import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { headlineForStore, landingMessage } from "./headline";

describe("detalle de sectores", () => {
  it("sin titular la landing no recibe mensaje", () => {
    expect(headlineForStore("  ")).toBeNull();
    expect(headlineForStore("El sector")).toBe("El sector");
    expect(landingMessage({ headline: null, body: "Cuerpo" })).toBeNull();
    expect(landingMessage({ headline: "  ", body: "Cuerpo" })).toBeNull();
    expect(landingMessage({ headline: "El sector", body: "Cuerpo" })).toEqual({
      headline: "El sector",
      body: "Cuerpo",
    });
  });

  it("el detalle lee sector_pages y no cambia el h1 por su cuenta", () => {
    const source = readFileSync("src/lib/admin/sectores/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/sectores/[id]/route.ts", "utf8");
    const hero = readFileSync("src/components/landing/sections/hero.tsx", "utf8");
    expect(source).toContain('.from("sector_pages")');
    expect(source).toContain("headline");
    expect(source).toContain("body");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).toContain("headlineForStore");
    expect(hero).toContain("message.headline");
  });
});
