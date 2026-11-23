import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la lista la lee el superadmin y filtra por sesión", () => {
  const source = readFileSync("src/lib/admin/registros/list.ts", "utf8");
  expect(source).toContain("adminDb");
  expect(source).toContain("public_registrations");
  expect(source).toContain("session_id");
  expect(source).toContain("sessions(");
  expect(source).toContain('eq("session_id"');
  expect(source).not.toContain("SERVICE_ROLE");
  const page = readFileSync("src/app/admin/registros/page.tsx", "utf8");
  expect(page).toContain("params.sesion");
  const screen = readFileSync("src/app/admin/registros/registros-list.tsx", "utf8");
  expect(screen).toContain("SessionFilter");
  const columns = readFileSync("src/app/admin/registros/registros-columns.tsx", "utf8");
  expect(columns).toContain("Sesión");
  expect(columns).toContain("/admin/cuentas/");
  expect(columns).toContain("Se enteró por");
});
