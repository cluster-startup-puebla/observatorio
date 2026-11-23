import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el registro usa la marca de la invitación como referencia", () => {
  const page = readFileSync("src/app/registro/page.tsx", "utf8");
  const fields = readFileSync("src/app/registro/registro-close-fields.tsx", "utf8");
  const action = readFileSync("src/app/registro/actions.ts", "utf8");
  expect(page).toContain("inviteReferralSource");
  expect(fields).toContain("lockedReferral");
  expect(action).toContain("inviteReferralSource");
});
