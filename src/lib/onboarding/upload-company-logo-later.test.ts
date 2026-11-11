import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lectura del logo de empresa", () => {
  it("busca un company_logo de ese perfil", () => {
    const source = readFileSync("src/lib/onboarding/company-has-logo.ts", "utf8");
    expect(source).toContain('eq("purpose", "company_logo")');
    expect(source).toContain('eq("profile_id", profileId)');
    expect(source).toContain("maybeSingle");
  });
});
