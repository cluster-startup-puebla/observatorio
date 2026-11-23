import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el CRM no suena a crear cuenta", () => {
  const hechos = readFileSync("src/app/admin/crm/[id]/hechos-panel.tsx", "utf8");
  const pending = readFileSync("src/components/organismo/pending-actions.tsx", "utf8");
  expect(hechos).toContain("Confirmar enlace");
  expect(hechos).not.toContain("Aceptar registro");
  expect(pending).toContain("Aceptar en lista");
});