import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("control de sesión del tablero", () => {
  const source = readFileSync("src/app/admin/tablero/session-select.tsx", "utf8");
  const page = readFileSync("src/app/admin/page.tsx", "utf8");

  it("exige elegir sesión antes de mostrar la convocatoria", () => {
    expect(source).toContain("Elige una sesión");
    expect(source).toContain("Ver convocatoria");
    expect(page).toContain("SessionPrompt");
    expect(page).toContain("Selecciona una sesión");
  });
});
