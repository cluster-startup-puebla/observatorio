import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("submit bloquea correos que ya tienen cuenta", () => {
  const actions = readFileSync("src/app/registro/actions.ts", "utf8");
  const submit = readFileSync("src/app/registro/run-registro-submit.ts", "utf8");
  const prompt = readFileSync("src/lib/registro/registro-login-prompt.ts", "utf8");
  const alert = readFileSync("src/app/registro/registro-account-alert.tsx", "utf8");
  expect(actions).toContain("registroEmailHasAccount");
  expect(prompt).toContain("ya_tiene_cuenta");
  expect(submit).toContain("yaTieneCuenta");
  expect(alert).toContain("/login");
  expect(alert).toContain("para apartar o ver tus sesiones");
});