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
    expect(route).toContain("export async function POST");
    expect(route).toContain('form.get("accion") === "eliminar"');
    expect(route).toContain('.from("companies").update');
    expect(route).not.toMatch(/export async function DELETE/);
    expect(route).not.toMatch(/export async function PATCH/);
  });

  it("la ficha lee la aceptación y el botón vive en su propia ruta", () => {
    const source = readFileSync("src/lib/admin/empresas/detail.ts", "utf8");
    const page = readFileSync("src/app/admin/empresas/[id]/page.tsx", "utf8");
    const route = readFileSync("src/app/api/admin/empresas/[id]/aceptar/route.ts", "utf8");
    expect(source).toContain("admitted_at");
    expect(source).toContain("externalApprovalLabel");
    expect(page).toContain("/aceptar");
    expect(page).toContain("Aceptar");
    expect(route).toContain('rpc("approve_external_signup"');
    expect(route).toContain("requireSuperadmin()");
  });

  it("la ficha traduce sector_lleno", () => {
    const page = readFileSync("src/app/admin/empresas/[id]/page.tsx", "utf8");
    const crm = readFileSync("src/app/admin/crm/[id]/page.tsx", "utf8");
    expect(page).toContain("seatFullCopy");
    expect(crm).toContain("seatFullCopy");
  });
});
