import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la página deja las 18 y sigue con el aviso de recarga", () => {
  const page = readFileSync("src/app/metodologia/page.tsx", "utf8");
  expect(page).toContain("prepareMetodologiaReload");
  expect(page).toContain("MetodologiaReloadNotice");
  expect(page).toContain("redirectUnfinishedEmpresario");
  expect(page).not.toContain("SECTIONS");
  expect(page).not.toContain("persona");
  expect(page).toContain("pickDraft");
  expect(page).toContain("readCompanyVerified");
  expect(page).toContain("PendingVerificationAlert");
});
