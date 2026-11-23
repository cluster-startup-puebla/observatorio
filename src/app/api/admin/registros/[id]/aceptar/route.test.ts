import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const route = readFileSync("src/app/api/admin/registros/[id]/aceptar/route.ts", "utf8");

it("el superadmin confirma RSVP y manda el pase sin crear password", () => {
  expect(route).toContain("requireSuperadmin");
  expect(route).toContain('rpc("confirm_registration_rsvp"');
  expect(route).toContain("sendRsvpPass");
  expect(route).toContain("NextResponse.redirect(url, 303)");
  expect(route).not.toContain("temporaryPassword");
  expect(route).not.toContain("accept_public_registration");
  expect(route).not.toContain("SERVICE_ROLE");
});
