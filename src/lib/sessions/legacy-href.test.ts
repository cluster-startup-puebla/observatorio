import { describe, expect, it } from "vitest";
import { legacyPieceHref } from "./legacy-href";

const slug = "18-11-26-arranque-puebla-x-puebla";

describe("ruta vieja hacia la sesión", () => {
  it("manda el organismo a la sesión", () => {
    expect(legacyPieceHref(slug, "canacintra")).toBe(`/sesiones/${slug}/canacintra`);
  });

  it("conserva el subcamino y la consulta", () => {
    expect(legacyPieceHref(slug, "canacintra", "crm", { vista: "tarjetas", corte: "turismo" })).toBe(
      `/sesiones/${slug}/canacintra/crm?vista=tarjetas&corte=turismo`,
    );
  });
});
