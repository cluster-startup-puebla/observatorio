import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LAVA_CODES } from "./codes";

describe("lava_actions seed", () => {
  it("migración crea catálogo con códigos estables y valores seed", () => {
    const sql = readFileSync("supabase/migrations/20261120030000_lava_actions.sql", "utf8");
    expect(sql).toContain("create table public.lava_actions");
    expect(sql).toContain("private.is_superadmin()");
    for (const code of Object.values(LAVA_CODES)) {
      expect(sql).toContain(`'${code}'`);
    }
    expect(sql).toContain("10");
    expect(sql).toContain("25");
    expect(sql).toContain("15");
    expect(sql).toContain("20");
  });
});
