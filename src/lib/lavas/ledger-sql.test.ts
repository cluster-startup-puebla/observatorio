import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lava_ledger", () => {
  it("ledger inmutable con origen y unicidad por ref", () => {
    const sql = readFileSync("supabase/migrations/20261120030200_lava_ledger.sql", "utf8");
    expect(sql).toContain("create table public.lava_ledger");
    expect(sql).toContain("origen text not null");
    expect(sql).toContain("live");
    expect(sql).toContain("backfill");
    expect(sql).toContain("manual");
    expect(sql).toContain("unique (company_id, action_code, ref_key)");
    expect(sql).toContain("revoke update");
    expect(sql).toContain("revoke delete");
  });
});
