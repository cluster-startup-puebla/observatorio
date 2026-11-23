import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/20261123020100_company_session_id.sql",
  "utf8",
);

it("empresa y pase heredan session_id del registro", () => {
  expect(sql).toContain("alter table public.companies");
  expect(sql).toContain("session_id uuid");
  expect(sql).toContain("accept_public_registration");
  expect(sql).toContain("row.session_id");
  expect(sql).toContain("enqueue_public_pass");
});
