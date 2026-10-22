import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("slug y aperturas en postgres", () => {
  const sql = readFileSync(
    "supabase/migrations/20261022120000_organization_slug_and_opens.sql",
    "utf8",
  );

  it("guarda el slug y cada apertura", () => {
    expect(sql).toContain("add column slug text");
    expect(sql).toContain("organizations_slug_idx");
    expect(sql).toContain("create table public.link_opens");
    expect(sql).toContain("record_link_open");
    expect(sql).toContain("finish_organization_brand");
    expect(sql).not.toContain("ref=");
  });
});
