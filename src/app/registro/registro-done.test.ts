import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el done no empuja crear cuenta como CTA principal", () => {
  const done = readFileSync("src/app/registro/registro-done.tsx", "utf8");
  expect(done).toContain("pase por correo");
  expect(done).not.toContain('className="btn btn-primary');
  expect(done).toContain("Crea acceso");
  expect(done).toContain("/login");
});
