import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lista de sectores", () => {
  it("lee slug, nombre y posición", () => {
    const list = readFileSync("src/lib/admin/sectores/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/sectores/route.ts", "utf8");
    expect(list).toContain('.from("sectors")');
    expect(list).toContain("slug");
    expect(list).toContain("name");
    expect(list).toContain("position");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
