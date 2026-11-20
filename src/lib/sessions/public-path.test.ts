import { describe, expect, it } from "vitest";
import { sessionPath, sessionPiecePath, sessionPublicSlug } from "./public-path";

describe("slug público de la sesión", () => {
  it("arma dd-mm-aa y el título", () => {
    expect(sessionPublicSlug("2026-11-18", "Arranque Puebla x Puebla")).toBe(
      "18-11-26-arranque-puebla-x-puebla",
    );
  });

  it("la ruta de la sesión y la del organismo no se pisan", () => {
    const slug = "05-10-26-club-de-empresarios";
    expect(sessionPath(slug)).toBe("/sesiones/05-10-26-club-de-empresarios");
    expect(sessionPiecePath(slug, "canacintra")).toBe(
      "/sesiones/05-10-26-club-de-empresarios/canacintra",
    );
  });
});
