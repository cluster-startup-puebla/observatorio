import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261123230000_verify_company_account.sql", "utf8");

it("verificación y claim no amarran cupo a admitted_at", () => {
  expect(sql).toContain("approve_external_signup");
  expect(sql).not.toContain("sector_source");
  expect(sql).toContain("ya está verificada");
  expect(sql).toContain("claim_session_seat");
  expect(sql).not.toContain("no_aceptada");
  expect(sql).not.toContain("admitted_at is not null");
});