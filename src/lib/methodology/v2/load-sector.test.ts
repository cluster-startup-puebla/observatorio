import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el cargador lista los 21 instrumentos y no arma la ruta con el id suelto", () => {
  const source = readFileSync("src/lib/methodology/v2/load-sector.ts", "utf8");
  expect(source).toContain('import("@/content/methodology/v2/n2/automotriz.json")');
  expect(source).toContain('import("@/content/methodology/v2/n2/educacion.json")');
  expect(source).not.toContain("n2/${");
});
