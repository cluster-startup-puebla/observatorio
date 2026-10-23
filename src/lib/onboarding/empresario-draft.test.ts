import { describe, expect, it } from "vitest";
import { empresarioErrors, parseEmpresarioForm } from "./empresario-draft";
import { stepReady } from "./empresario-steps";

const valid = {
  fullName: "Ana López",
  jobTitle: "Directora",
  whatsapp: "2221234567",
  companyName: "Taller Norte",
  marketSize: "regional",
  employeeBand: "11–50",
  municipality: "Puebla",
  sectorSlug: "automotriz-y-autopartes",
  referralSource: "Clúster Automotriz",
  sessionInterest: "Diagnóstico y proveedores",
  showLogo: false,
  hasLogo: false,
};

function fill(form: FormData, values: Record<string, string | boolean>) {
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") form.set(key, value);
  }
}

describe("onboarding empresario", () => {
  it("acepta el perfil completo", () => {
    const form = new FormData();
    fill(form, valid);
    form.set("sector", valid.sectorSlug);
    expect(empresarioErrors(parseEmpresarioForm(form))).toBeNull();
  });

  it("el paso de empresa exige industria y mercado", () => {
    expect(stepReady(1, { ...valid, marketSize: "", sectorSlug: "" })).toBe(false);
    expect(stepReady(1, valid)).toBe(true);
  });

  it("el check del logo exige un archivo", () => {
    expect(stepReady(1, { ...valid, showLogo: true, hasLogo: false })).toBe(false);
    expect(stepReady(1, { ...valid, showLogo: true, hasLogo: true })).toBe(true);
    expect(stepReady(1, { ...valid, showLogo: false, hasLogo: false })).toBe(true);
  });

  it("acepta una industria que no está en la lista", () => {
    const form = new FormData();
    fill(form, { ...valid, sectorSlug: "Cerámica" });
    form.set("sector", "Cerámica");
    const parsed = parseEmpresarioForm(form);
    expect(parsed.sectorSlug).toBe("Cerámica");
    expect(empresarioErrors(parsed)).toBeNull();
    expect(stepReady(1, { ...valid, sectorSlug: "Cerámica" })).toBe(true);
  });
});
