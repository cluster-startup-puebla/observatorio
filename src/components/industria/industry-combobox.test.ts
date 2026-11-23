import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("industry combobox compartido", () => {
  it("onboarding, registro y organismo usan el mismo catálogo", () => {
    const shared = readFileSync("src/components/industria/industry-combobox.tsx", "utf8");
    const onboarding = readFileSync("src/components/onboarding/empresario-company-facts.tsx", "utf8");
    const registro = readFileSync("src/app/registro/registro-sector-field.tsx", "utf8");
    const org = readFileSync("src/components/organismo/copy-link-sector.tsx", "utf8");
    const sectors = readFileSync("src/lib/sectors.ts", "utf8");
    expect(shared).toContain('from "@/lib/sectors"');
    expect(onboarding).toContain("IndustryCombobox");
    expect(registro).toContain("IndustryCombobox");
    expect(org).toContain("IndustryCombobox");
    const session = readFileSync("src/components/organismo/copy-link-session.tsx", "utf8");
    expect(session).toContain("OnboardingSelect");
    expect(sectors).not.toContain("heldThisSession");
  });
});
