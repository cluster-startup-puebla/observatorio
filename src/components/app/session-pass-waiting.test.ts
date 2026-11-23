import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la espera no promete lugar y explica el flujo", () => {
  const waiting = readFileSync("src/components/app/session-pass-waiting.tsx", "utf8");
  expect(waiting).toContain("Pendiente de aceptación");
  expect(waiting).not.toContain("Ya tienes lugar");
  expect(waiting).not.toContain("gradient");
  expect(waiting).toContain("Solicitud enviada");
  expect(waiting).toContain("Revisión en lista");
  expect(waiting).toContain("Pase y QR");
  expect(waiting).toContain("pase-en-espera");
});
