import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lectura del logo de empresa", () => {
  it("busca un company_logo de ese perfil", () => {
    const source = readFileSync("src/lib/onboarding/company-has-logo.ts", "utf8");
    expect(source).toContain('eq("purpose", "company_logo")');
    expect(source).toContain('eq("profile_id", profileId)');
    expect(source).toContain("maybeSingle");
  });

  it("actualiza solo el check y no vuelve a terminar el perfil", () => {
    const source = readFileSync("src/lib/onboarding/upload-company-logo-later.ts", "utf8");
    expect(source).toContain("saveCompanyLogo");
    expect(source).toContain("show_logo_on_event");
    expect(source).toContain("onboarded_at");
    expect(source).toContain('redirect("/onboarding?error=logo")');
    expect(source).toContain('redirect("/onboarding")');
    expect(source).not.toContain("saveEmpresarioProfile");
    expect(source).not.toContain("issueConfirmedPass");
    expect(source).not.toContain("onboarded_at:");
  });

  it("la espera y el pase explican las pantallas y reutilizan el check", () => {
    const form = readFileSync("src/components/onboarding/later-logo-form.tsx", "utf8");
    const finished = readFileSync("src/components/onboarding/finished-profile.tsx", "utf8");
    const wizard = readFileSync("src/components/onboarding/onboarding-wizard.tsx", "utf8");
    expect(form).toContain("Veo que no tienes logo. ¿Te gustaría subirlo ahora?");
    expect(form).toContain("Durante el evento tu logo puede aparecer en las pantallas.");
    expect(form).toContain("CompanyLogoFields");
    expect(form).toContain("uploadCompanyLogoLater");
    expect(form).toContain("Alert");
    expect(form).not.toContain("deferrable");
    expect(finished).toContain("LaterLogoForm");
    expect(finished).toContain('gate === "espera"');
    expect(finished).toContain("AccessPass");
    expect(wizard).toContain("offerLogo");
  });

  it("la pantalla de Supabase calcula la oferta y la de memoria no", () => {
    const screen = readFileSync("src/app/onboarding/supabase-screen.tsx", "utf8");
    const memory = readFileSync("src/app/onboarding/page.tsx", "utf8");
    expect(screen).toContain("companyHasLogo");
    expect(screen).toContain("laterLogoOffer");
    expect(screen).toContain("offerLogo={offerLogo}");
    expect(screen).toContain('params.error === "logo"');
    expect(memory).toContain("offerLogo={false}");
  });
});
