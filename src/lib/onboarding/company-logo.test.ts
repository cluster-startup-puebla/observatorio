import { describe, expect, it } from "vitest";
import { companyLogoObjectPath } from "@/lib/storage-assets";
import { logoUploadDecision } from "./company-logo";

const id = "11111111-1111-4111-8111-111111111111";

describe("logo de empresa", () => {
  it("arma la ruta png, jpg o webp del perfil", () => {
    expect(companyLogoObjectPath(id, "image/png")).toBe(`${id}/logo.png`);
    expect(companyLogoObjectPath(id, "image/jpeg")).toBe(`${id}/logo.jpg`);
    expect(companyLogoObjectPath(id, "image/webp")).toBe(`${id}/logo.webp`);
    expect(() => companyLogoObjectPath(id, "image/gif")).toThrow("tipo de imagen no permitido");
  });

  it("sin check y sin archivo no sube", () => {
    expect(logoUploadDecision({ show: false, hasFile: false })).toEqual({ action: "skip" });
  });

  it("el check sin archivo se rechaza", () => {
    expect(logoUploadDecision({ show: true, hasFile: false })).toEqual({ action: "reject" });
  });

  it("con archivo sube y el check decide si se muestra", () => {
    expect(logoUploadDecision({ show: true, hasFile: true })).toEqual({ action: "store", show: true });
    expect(logoUploadDecision({ show: false, hasFile: true })).toEqual({ action: "store", show: false });
  });
});
