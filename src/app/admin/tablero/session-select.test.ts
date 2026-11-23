import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("control de sesión del tablero", () => {
  const source = readFileSync("src/app/admin/tablero/session-select.tsx", "utf8");
  const page = readFileSync("src/app/admin/page.tsx", "utf8");

  it("va arriba del tablero, con loading y detalle", () => {
    expect(page).toContain("<SessionSelect");
    expect(page.indexOf("<SessionSelect")).toBeLessThan(page.indexOf("<TableroBoard"));
    expect(source).toContain("useTransition");
    expect(source).toContain("Cargando…");
    expect(source).toContain("Ver convocatoria");
    expect(source).toContain("Ver detalle");
    expect(source).toContain("/admin/sesiones/");
  });
});
