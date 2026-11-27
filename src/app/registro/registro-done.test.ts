import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el done avisa del pase por correo y ofrece crear cuenta o iniciar sesión sin CTA principal", () => {
  const done = readFileSync("src/app/registro/registro-done.tsx", "utf8");
  expect(done).toContain("pase por correo");
  expect(done).not.toContain('className="btn btn-primary');
  expect(done).toContain("¿No tienes cuenta?");
  expect(done).toContain("Créala");
  expect(done).toContain("¿Ya tienes?");
  expect(done).toContain("Inicia sesión");
  expect(done).toContain("/login");
});
