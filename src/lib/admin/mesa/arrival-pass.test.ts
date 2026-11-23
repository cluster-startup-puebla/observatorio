import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el trigger de llegada acepta passes o rsvp_passes", () => {
  const sql = readFileSync("supabase/migrations/20261124050000_arrival_pass_accepts_rsvp.sql", "utf8");
  expect(sql).toContain("require_arrival_pass");
  expect(sql).toContain("public.passes");
  expect(sql).toContain("rsvp_passes");
  expect(sql).toContain("session_rsvps");
});
