import { describe, expect, it } from "vitest";
import { companyLogoSrc } from "./company-logo-src";

describe("logo de la empresa en la tabla", () => {
  it("omite la imagen cuando no hay archivo", () => {
    expect(companyLogoSrc("c1", false)).toBe("");
  });

  it("apunta a la ruta del panel cuando el archivo existe", () => {
    expect(companyLogoSrc("c1", true)).toBe("/api/admin/empresas/c1/logo");
  });
});
