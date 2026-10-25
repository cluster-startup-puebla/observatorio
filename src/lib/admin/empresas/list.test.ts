import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bandLabel } from "./band-label";

describe("lista de empresas", () => {
  it("traduce la banda guardada", () => {
    expect(bandLabel("1_10")).toBe("1–10");
    expect(bandLabel("11_50")).toBe("11–50");
    expect(bandLabel("51_250")).toBe("51–250");
    expect(bandLabel("250_plus")).toBe("250+");
    expect(bandLabel("otra")).toBe("");
  });

  it("la lista lee companies y el tamaño", () => {
    const list = readFileSync("src/lib/admin/empresas/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/empresas/route.ts", "utf8");
    expect(list).toContain('.from("companies")');
    expect(list).toContain("legal_name");
    expect(list).toContain("employee_band");
    expect(list).toContain("admitted_at");
    expect(list).toContain("externalApprovalLabel");
    expect(list).toContain("sectorSourceLabel");
    expect(list).toContain("sector_id");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
