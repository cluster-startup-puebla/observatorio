import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261113142000_list_missing_passes.sql", "utf8");
const repair = readFileSync("src/lib/admin/pases/repair.ts", "utf8");
const route = readFileSync("src/app/api/admin/pases/faltantes/route.ts", "utf8");

it("lista aceptados sin archivo y no reenvía el correo", () => {
  expect(sql).toContain("function public.list_missing_passes()");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).toContain("admitted_at is not null");
  expect(sql).toContain("'confirmo', 'registrado', 'llego'");
  expect(sql).not.toContain("to anon");
  expect(repair).toContain('rpc("list_missing_passes")');
  expect(repair).toContain("writePass");
  expect(repair).not.toContain("Resend");
  expect(repair).not.toContain("sendAcceptedPass");
  expect(repair).not.toContain("sendPublicPass");
  expect(route).toContain("requireSuperadmin");
  expect(route).toContain("repairMissingPasses");
});
