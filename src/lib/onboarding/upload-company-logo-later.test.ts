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
});
