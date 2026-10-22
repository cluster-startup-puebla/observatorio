import { describe, expect, it } from "vitest";
import { orgSlug, slugError } from "./slug";

describe("slug del organismo", () => {
  const sectors = ["turismo", "automotriz-y-autopartes"];

  it("sale del nombre y respeta uno escrito", () => {
    expect(orgSlug("Coparmex Puebla", "")).toBe("coparmex-puebla");
    expect(orgSlug("Coparmex Puebla", "copamex-puebla")).toBe("copamex-puebla");
    expect(orgSlug("CANACINTRA", "")).toBe("canacintra");
  });

  it("rechaza vacío, corto y un sector", () => {
    expect(slugError("", sectors)).toBe("slug inválido");
    expect(slugError("a", sectors)).toBe("slug inválido");
    expect(slugError("turismo", sectors)).toBe("ese enlace es de un sector");
    expect(slugError("coparmex-puebla", sectors)).toBeNull();
  });
});
