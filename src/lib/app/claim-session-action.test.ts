import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("apartar solo reserva el lugar; el pase lo manda la aceptación CRM", () => {
  const source = readFileSync("src/lib/app/claim-session-action.ts", "utf8");
  expect(source).toContain("claim_session_seat");
  expect(source).not.toContain("deliverRsvpPass");
  expect(source).toContain("revalidatePath");
});
