import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyLogoSrc } from "./company-logo-src";

describe("logo de la empresa en la tabla", () => {
  it("omite la imagen cuando no hay archivo", () => {
    expect(companyLogoSrc("c1", false)).toBe("");
  });

  it("apunta a la ruta del panel cuando el archivo existe", () => {
    expect(companyLogoSrc("c1", true)).toBe("/api/admin/empresas/c1/logo");
  });

  it("el panel entrega el archivo sin pedir el check del evento", () => {
    const route = readFileSync("src/app/api/admin/empresas/[id]/logo/route.ts", "utf8");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).toContain('eq("purpose", "company_logo")');
    expect(route).toContain('.from("company-logos")');
    expect(route).not.toContain("show_logo_on_event");
  });
});
