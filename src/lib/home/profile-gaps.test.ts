import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { gapCaption, profileGaps } from "./profile-gaps";

const logo = { id: "logo", label: "Logo" };
const website = { id: "website", label: "Sitio web" };
const verify = { id: "verify", label: "Verificar cuenta" };

describe("huecos del perfil", () => {
  it("logo y sitio faltantes cuentan como el paso 1 de 2", () => {
    const result = profileGaps({ hasLogo: false, website: "" });
    expect(result.total).toBe(3);
    expect(result.counter).toBe("1/2");
    expect(result.gaps).toEqual([logo, website]);
  });

  it("un solo hueco es 1/1", () => {
    const result = profileGaps({ hasLogo: true, website: "" });
    expect(result.counter).toBe("1/1");
    expect(result.gaps).toEqual([website]);
    expect(gapCaption(1)).toBe("acción faltante");
    expect(profileGaps({ hasLogo: false, website: "ejemplo.com" }).counter).toBe("1/1");
  });

  it("logo y sitio listos dejan la lista vacía", () => {
    const result = profileGaps({ hasLogo: true, website: "ejemplo.com" });
    expect(result.counter).toBe("0/3");
    expect(result.gaps).toEqual([]);
  });

  it("suma verificar cuenta cuando el correo no está confirmado", () => {
    const all = profileGaps({ hasLogo: false, website: "", emailConfirmed: false });
    expect(all.counter).toBe("1/3");
    expect(all.gaps).toEqual([logo, website, verify]);
    const logoAndMail = profileGaps({ hasLogo: false, website: "ejemplo.com", emailConfirmed: false });
    expect(logoAndMail.counter).toBe("1/2");
    expect(logoAndMail.gaps).toEqual([logo, verify]);
    expect(profileGaps({ hasLogo: true, website: "ejemplo.com", emailConfirmed: false }).gaps).toEqual([verify]);
  });

  it("lee el sitio, el logo y si el correo ya está confirmado", () => {
    const source = readFileSync("src/lib/home/load-profile-gaps.ts", "utf8");
    expect(source).toContain("companyHasLogo");
    expect(source).toContain('from("companies")');
    expect(source).toContain('select("website")');
    expect(source).toContain('eq("profile_id", profileId)');
    expect(source).toContain("email_confirmed_at");
  });

  it("el banner guarda con las funciones que ya existen", () => {
    const pieces = readFileSync("src/lib/home/profile-gaps.ts", "utf8");
    const banner = readFileSync("src/components/app/profile-gap-banner.tsx", "utf8");
    const forms = readFileSync("src/components/app/profile-gap-forms.tsx", "utf8");
    const file = readFileSync("src/components/app/logo-file-field.tsx", "utf8");
    const action = readFileSync("src/lib/home/save-profile-gaps.ts", "utf8");
    expect(pieces).toContain('label: "Sitio web"');
    expect(pieces).toContain('label: "Verificar cuenta"');
    expect(banner).toContain("AppCard");
    expect(banner).toContain("Completa tu perfil");
    expect(banner).toContain("return null");
    expect(file).toContain('name="logo"');
    expect(forms).toContain('name="website"');
    expect(forms).toContain('label="Sitio web"');
    expect(forms).toContain("Enviar correo");
    expect(forms).toContain('variant="destructive"');
    expect(forms).not.toContain("window.alert");
    expect(action).toContain("saveCompanyLogo");
    expect(action).toContain("websiteError");
    expect(action).toContain("resendSignupConfirmation");
    expect(action).toContain("createSupabaseWithAccess");
    expect(action).toContain('from("companies")');
    expect(action).toContain('const home = "/app/home"');
    expect(action).toContain("revalidatePath(home)");
    expect(action).toContain("redirect(home)");
  });
});