import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/20261123020000_registration_session_id.sql",
  "utf8",
);

it("liga registro público a sessions", () => {
  expect(sql).toContain("alter table public.public_registrations");
  expect(sql).toContain("session_id uuid");
  expect(sql).toContain("references public.sessions");
  expect(sql).toContain("start_public_registration");
  expect(sql).toContain("p_session_id");
});
