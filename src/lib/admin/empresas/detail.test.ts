import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tabQuery } from "@/lib/admin/tab-query";
import { companyTabs } from "./tabs";

describe("detalle de empresas", () => {
  it("abre en sector y conserva tamaño, respuestas y pase", () => {
    const values = companyTabs.map((tab) => tab.value);
    expect(values).toEqual(["sector", "tamano", "respuestas", "pase"]);
    expect(tabQuery(undefined, values, "sector")).toBe("sector");
    expect(tabQuery("pase", values, "sector")).toBe("pase");
    expect(tabQuery("borrar", values, "sector")).toBe("sector");
  });

  it("el detalle lee sector, banda, respuestas y pase", () => {
    const source = readFileSync("src/lib/admin/empresas/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/empresas/[id]/route.ts", "utf8");
    expect(source).toContain('.from("companies")');
    expect(source).toContain("employee_band");
    expect(source).toContain('.from("sectors")');
    expect(source).toContain('.from("response_choices")');
    expect(source).toContain('.from("passes")');
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
    expect(route).not.toMatch(/export async function POST/);
    expect(route).not.toMatch(/export async function PATCH/);
  });
});
