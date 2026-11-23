import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el registro público muestra el formulario y no redirige a crear cuenta", () => {
  const page = readFileSync("src/app/registro/page.tsx", "utf8");
  const form = readFileSync("src/app/registro/registro-form.tsx", "utf8");
  expect(page).toContain("RegistroForm");
  expect(page).not.toContain("redirect(`/crear-cuenta");
  expect(form).not.toContain("Paso");
  expect(form).not.toContain("CompanyLogoFields");
  expect(form).not.toContain("contrasena");
  expect(form).toContain("lockedReferral");
  expect(form).toContain("RegistroAccountAlert");
});

