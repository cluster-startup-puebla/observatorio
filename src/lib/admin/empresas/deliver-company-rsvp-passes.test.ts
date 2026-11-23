import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("al aceptar path se entregan los pases RSVP confirmados", () => {
  const deliver = readFileSync("src/lib/admin/empresas/deliver-company-rsvp-passes.ts", "utf8");
  const route = readFileSync("src/app/api/admin/empresas/[id]/aceptar/route.ts", "utf8");
  expect(deliver).toContain("deliverRsvpPass");
  expect(deliver).toContain('eq("status", "confirmed")');
  expect(route).toContain("deliverCompanyRsvpPasses");
  expect(route).toContain('rpc("approve_external_signup"');
});
