import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { organizationPatch } from "./organization-patch";

describe("lista de organismos", () => {
  it("acepta nombre y color hex y no marca la marca sin logo", () => {
    expect(organizationPatch({ name: "A", brandColor: "#1B3A5C" }).ok).toBe(false);
    expect(organizationPatch({ name: "CANACINTRA", brandColor: "azul" }).ok).toBe(false);
    expect(organizationPatch({ name: "CANACINTRA", brandColor: "#1B3A5C" })).toEqual({
      ok: true,
      name: "CANACINTRA",
      brand_color: "#1B3A5C",
    });
  });

  it("la lista lee organizations y no exporta DELETE", () => {
    const list = readFileSync("src/lib/admin/organismos/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/organismos/route.ts", "utf8");
    expect(list).toContain('.from("organizations")');
    expect(list).toContain("name");
    expect(list).toContain("brand_color");
    expect(list).toContain("brand_completed_at");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
    const remote = readFileSync("src/lib/admin/organismos/create-remote.ts", "utf8");
    expect(remote.indexOf(".upload(")).toBeLessThan(remote.indexOf("create_organization_brand"));
  });
});
