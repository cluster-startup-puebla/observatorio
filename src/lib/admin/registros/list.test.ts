import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la lista la lee el superadmin", () => {
  const source = readFileSync("src/lib/admin/registros/list.ts", "utf8");
  expect(source).toContain("adminDb");
  expect(source).toContain("public_registrations");
  expect(source).toContain("id, full_name");
  expect(source).toContain("referral_source");
  expect(source).toContain("poured_profile_id");
  expect(source).toContain('from("companies")');
  expect(source).not.toContain("SERVICE_ROLE");
  const screen = readFileSync("src/app/admin/registros/registros-list.tsx", "utf8");
  expect(screen).toContain("/admin/cuentas/");
  expect(screen).toContain("/admin/empresas/");
  expect(screen).toContain("Se enteró por");
});
