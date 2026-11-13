import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261113141000_enqueue_public_pass.sql", "utf8");

it("el superadmin encola el pase del perfil", () => {
  expect(sql).toContain("function public.enqueue_public_pass(guest_id uuid)");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).toContain("'event_pass'");
  expect(sql).toContain("'Tu pase para la sesión ya está listo'");
  expect(sql).toContain("grant execute on function public.enqueue_public_pass(uuid) to authenticated");
  expect(sql).not.toContain("to anon");
});
