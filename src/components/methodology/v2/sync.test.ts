import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el envío usa el plan y no bloquea la pregunta siguiente", () => {
  const source = readFileSync("src/components/methodology/v2/sync.tsx", "utf8");
  expect(source).toContain("flushPlan");
  expect(source).toContain("/api/metodologia/envio");
  expect(source).toContain('toast.error("No se guardó. Vuelve a intentarlo.")');
  expect(source).toContain("online");
  expect(source).not.toContain("await fetch");
});
