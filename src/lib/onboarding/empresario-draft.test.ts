import { describe, expect, it } from "vitest";
import { empresarioErrors, parseEmpresarioForm } from "./empresario-draft";
import { stepReady } from "./empresario-steps";

const valid = {
  fullName: "Ana López",
  jobTitle: "Directora",
  whatsapp: "2221234567",
  companyName: "Taller Norte",
  website: "ejemplo.com",
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

  it("el check del logo sin archivo no bloquea el paso", () => {
    expect(stepReady(1, { ...valid, showLogo: true, hasLogo: false })).toBe(true);
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

  it("el sitio acepta dominio o https y rechaza vacío, espacios o más de 200", () => {
    const form = new FormData();
    fill(form, valid);
    form.set("sector", valid.sectorSlug);
    expect(parseEmpresarioForm(form).website).toBe("ejemplo.com");
    fill(form, { ...valid, website: "  https://ejemplo.com  " });
    const https = parseEmpresarioForm(form);
    expect(https.website).toBe("https://ejemplo.com");
    expect(empresarioErrors(https)).toBeNull();
    fill(form, { ...valid, website: "" });
    expect(empresarioErrors(parseEmpresarioForm(form))).toBe("sitio");
    expect(stepReady(1, { ...valid, website: "" })).toBe(false);
    fill(form, { ...valid, website: "ejemplo .com" });
    expect(empresarioErrors(parseEmpresarioForm(form))).toBe("sitio");
    fill(form, { ...valid, website: "hola" });
    expect(empresarioErrors(parseEmpresarioForm(form))).toBe("sitio");
    fill(form, { ...valid, website: `${"ejemplo.".repeat(40)}com` });
    expect(empresarioErrors(parseEmpresarioForm(form))).toBe("sitio");
  });

  it("un comentario de más de 500 caracteres no pasa", () => {
    const form = new FormData();
    fill(form, { ...valid, sessionInterest: "a".repeat(501) });
    form.set("sector", valid.sectorSlug);
    expect(empresarioErrors(parseEmpresarioForm(form))).toBe("interes");
  });
});
