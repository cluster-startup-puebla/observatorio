import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el filtro de sesión usa loading y el mismo estilo del tablero", () => {
  const source = readFileSync("src/components/admin/session-filter.tsx", "utf8");
  expect(source).toContain("useTransition");
  expect(source).toContain("Cargando…");
  expect(source).toContain("sessionSelectClass");
  expect(source).toContain("rounded-full");
  expect(source).toContain("sesion");
  expect(source).toContain("Todas las sesiones");
});
