import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el registro es una sola pantalla y no pide cuenta ni logo", () => {
  const page = readFileSync("src/app/registro/page.tsx", "utf8");
  const form = readFileSync("src/app/registro/registro-form.tsx", "utf8");
  expect(page).toContain("Desayuno Foro Puebla x Puebla");
  expect(page).toContain("SessionFacts");
  expect(form).not.toContain("Paso");
  expect(form).not.toContain("CompanyLogoFields");
  expect(form).not.toContain("contrasena");
});
