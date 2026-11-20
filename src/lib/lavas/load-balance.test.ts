import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("loadLavaBalance", () => {
  it("suma amount del ledger de la empresa", () => {
    const src = readFileSync("src/lib/lavas/load-balance.ts", "utf8");
    expect(src).toContain('.from("lava_ledger")');
    expect(src).toContain("reduce");
  });
});
