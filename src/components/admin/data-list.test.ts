import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("DataList", () => {
  it("pagina con listHref para no perder q", () => {
    const source = readFileSync("src/components/admin/data-list.tsx", "utf8");
    expect(source).toContain("listHref");
    expect(source).toContain("toolbar");
    expect(source).not.toContain("`/${basePath}?page=${next}`");
  });
});
