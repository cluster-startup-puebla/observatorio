import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lava_boost_config", () => {
  it("una fila con multiplicador y bono fijo", () => {
    const sql = readFileSync("supabase/migrations/20261120030100_lava_boost_config.sql", "utf8");
    expect(sql).toContain("create table public.lava_boost_config");
    expect(sql).toContain("multiplier numeric");
    expect(sql).toContain("flat_bonus integer");
    expect(sql).toContain("check (id = 1)");
    expect(sql).toContain("insert into public.lava_boost_config");
  });
});
