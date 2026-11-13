import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la lista la lee el superadmin", () => {
  const source = readFileSync("src/lib/admin/registros/list.ts", "utf8");
  expect(source).toContain("adminDb");
  expect(source).toContain("public_registrations");
  expect(source).toContain("id, full_name");
  expect(source).not.toContain("SERVICE_ROLE");
});
