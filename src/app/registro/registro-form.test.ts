import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el formulario no pide cuenta ni logo", () => {
  const source = readFileSync("src/app/registro/registro-form.tsx", "utf8");
  expect(source).toContain("Paso");
  expect(source).not.toContain("CompanyLogoFields");
  expect(source).not.toContain("contrasena");
});
