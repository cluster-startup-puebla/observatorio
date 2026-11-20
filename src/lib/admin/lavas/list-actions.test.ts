import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("listLavaActions", () => {
  it("excluye ajuste_manual y exige superadmin", () => {
    const src = readFileSync("src/lib/admin/lavas/list-actions.ts", "utf8");
    const page = readFileSync("src/app/admin/lavas/page.tsx", "utf8");
    expect(src).toContain('neq("code", "ajuste_manual")');
    expect(src).toContain("adminDb");
    expect(page).toContain("await requireSuperadmin()");
    expect(page).toContain("listLavaActions");
  });
});
