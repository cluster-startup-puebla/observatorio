import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la espera de sesión ya no amarra verificación de cuenta", () => {
  const source = readFileSync("src/lib/auth/awaiting-approval.ts", "utf8");
  expect(source).not.toContain("externalPassPending");
  expect(source).toContain("holdsSession({ cancelled, linkPending })");
});