import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el registro público manda a crear la cuenta", () => {
  const page = readFileSync("src/app/registro/page.tsx", "utf8");
  const form = readFileSync("src/app/registro/registro-form.tsx", "utf8");
  expect(page).toContain("redirect(`/crear-cuenta${suffix}`)");
  expect(page).not.toContain("RegistroForm");
  expect(form).not.toContain("Paso");
  expect(form).not.toContain("CompanyLogoFields");
  expect(form).not.toContain("contrasena");
});
