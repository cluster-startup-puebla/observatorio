import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("backfill_lavas", () => {
  it("RPC solo superadmin con origen backfill", () => {
    const sql = readFileSync("supabase/migrations/20261120030400_lava_backfill_rpc.sql", "utf8");
    expect(sql).toContain("function public.backfill_lavas()");
    expect(sql).toContain("'backfill'");
    expect(sql).toContain("private.is_superadmin()");
  });

  it("admin dispara el RPC", () => {
    const src = readFileSync("src/lib/admin/lavas/run-backfill.ts", "utf8");
    expect(src).toContain('rpc("backfill_lavas")');
  });
});
