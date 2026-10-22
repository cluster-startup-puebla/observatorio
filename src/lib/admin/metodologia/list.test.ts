import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { rangeKind } from "./range-kind";

describe("lista de metodología", () => {
  it("solo acepta high o low", () => {
    expect(rangeKind("high")).toBe("high");
    expect(rangeKind("low")).toBe("low");
    expect(rangeKind("media")).toBeNull();
  });

  it("la lista lee instrument_sections", () => {
    const list = readFileSync("src/lib/admin/metodologia/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/metodologia/route.ts", "utf8");
    expect(list).toContain('.from("instrument_sections")');
    expect(list).toContain("name");
    expect(list).toContain("position");
    expect(list).toContain("range_kind");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
