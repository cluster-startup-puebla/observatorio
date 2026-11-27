import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261126235500_accept_reuses_sibling_account.sql", "utf8");

it("reutiliza la cuenta de otro registro del mismo correo sin fallar con ya tiene cuenta", () => {
  expect(sql).toContain("registration.poured_profile_id is not null");
  expect(sql).toContain("if guest is not null then");
  expect(sql).toContain("raise exception 'ya tiene cuenta'");
});

it("valida registro completo antes de reutilizar la cuenta", () => {
  const incompleto = sql.indexOf("raise exception 'incompleto'");
  const reutiliza = sql.indexOf("registration.poured_profile_id is not null");
  expect(incompleto).toBeGreaterThan(-1);
  expect(reutiliza).toBeGreaterThan(incompleto);
});
