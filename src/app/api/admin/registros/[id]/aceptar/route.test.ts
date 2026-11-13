import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const route = readFileSync("src/app/api/admin/registros/[id]/aceptar/route.ts", "utf8");

it("el superadmin acepta, vuelca y manda el pase", () => {
  expect(route).toContain("requireSuperadmin");
  expect(route).toContain("temporaryPassword");
  expect(route).toContain('rpc("accept_public_registration"');
  expect(route).toContain("sendPublicPass");
  expect(route).toContain("openRef");
  expect(route).not.toContain("SERVICE_ROLE");
});
