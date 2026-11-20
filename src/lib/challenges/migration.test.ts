import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261120140000_challenges.sql", "utf8");

describe("challenges migration", () => {
  it("creates challenges and applications with RLS", () => {
    expect(sql).toContain("create table public.challenges");
    expect(sql).toContain("description_html");
    expect(sql).toContain("create table public.challenge_applications");
    expect(sql).toContain("applicant_type");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("challenges_portal_select");
    expect(sql).toContain("challenges_own");
    expect(sql).toContain("private.is_superadmin()");
    expect(sql).toContain("challenge_applications_superadmin_select");
  });
});
