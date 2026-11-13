import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261113140000_accept_public_registration.sql", "utf8");

it("solo el superadmin acepta y la contraseña no queda en el SQL", () => {
  expect(sql).toContain("function public.accept_public_registration(");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).toContain("private.sector_is_full(sector)");
  expect(sql).toContain("grant execute on function public.accept_public_registration(uuid, text, uuid) to authenticated");
  expect(sql).not.toContain("to anon");
  expect(sql).not.toContain("Observatorio2026");
  expect(sql).not.toContain("SERVICE_ROLE");
});
