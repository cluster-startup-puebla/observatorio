import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la card nombra al sector y el botón genérico espera", () => {
  const source = readFileSync("src/components/app/evaluation-banner.tsx", "utf8");
  expect(source).toContain("tiene un nuevo formulario para ti");
  expect(source).toContain("ActionButton");
  expect(source).toContain("hold");
  expect(source).toContain('pendingLabel="Abriendo…"');
  expect(source).toContain("Realiza tu primera evaluación");
  expect(source).toContain('router.push("/metodologia")');
});
