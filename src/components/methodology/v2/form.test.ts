import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("continuar no espera un POST", () => {
  const source = readFileSync("src/components/methodology/v2/form.tsx", "utf8");
  expect(source).toContain("writeDraft");
  expect(source).not.toContain("/api/metodologia/envio");
  expect(source).not.toContain("fetch(");
});
