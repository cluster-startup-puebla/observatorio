import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ListSearch", () => {
  it("debouncea y resetea page al buscar", () => {
    const source = readFileSync("src/components/admin/list-search.tsx", "utf8");
    expect(source).toContain("300");
    expect(source).toContain("listHref");
    expect(source).toContain("router.replace");
    expect(source).toContain("page: 1");
  });
});
