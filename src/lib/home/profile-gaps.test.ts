import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { profileGaps } from "./profile-gaps";

const logo = { id: "logo", label: "Logo" };
const website = { id: "website", label: "Sitio web" };

describe("huecos del perfil", () => {
  it("sin nada queda 2/2 con logo y sitio", () => {
    const result = profileGaps({ hasLogo: false, website: "" });
    expect(result.total).toBe(2);
    expect(result.counter).toBe("2/2");
    expect(result.gaps).toEqual([logo, website]);
  });

  it("con logo y sitio vacío queda 1/2 y solo el sitio", () => {
    const result = profileGaps({ hasLogo: true, website: "" });
    expect(result.total).toBe(2);
    expect(result.counter).toBe("1/2");
    expect(result.gaps).toEqual([website]);
    expect(profileGaps({ hasLogo: true, website: "   " }).gaps).toEqual([website]);
  });

  it("con los dos deja la lista vacía", () => {
    const result = profileGaps({ hasLogo: true, website: "ejemplo.com" });
    expect(result.total).toBe(2);
    expect(result.counter).toBe("0/2");
    expect(result.gaps).toEqual([]);
  });

  it("lee el sitio y reutiliza la búsqueda del logo", () => {
    const source = readFileSync("src/lib/home/load-profile-gaps.ts", "utf8");
    expect(source).toContain("companyHasLogo");
    expect(source).toContain('from("companies")');
    expect(source).toContain('select("website")');
    expect(source).toContain('eq("profile_id", profileId)');
  });

  it("el banner guarda con las funciones que ya existen", () => {
    const pieces = readFileSync("src/lib/home/profile-gaps.ts", "utf8");
    const banner = readFileSync("src/components/app/profile-gap-banner.tsx", "utf8");
    const forms = readFileSync("src/components/app/profile-gap-forms.tsx", "utf8");
    const action = readFileSync("src/lib/home/save-profile-gaps.ts", "utf8");
    expect(pieces).toContain('label: "Sitio web"');
    expect(banner).toContain("AppCard");
    expect(banner).toContain("Completa tu perfil");
    expect(banner).toContain("return null");
    expect(forms).toContain('name="logo"');
    expect(forms).toContain('name="website"');
    expect(forms).toContain('label="Sitio web"');
    expect(forms).toContain('variant="destructive"');
    expect(forms).not.toContain("window.alert");
    expect(action).toContain("saveCompanyLogo");
    expect(action).toContain("websiteError");
    expect(action).toContain("createSupabaseWithAccess");
    expect(action).toContain('from("companies")');
    expect(action).toContain('const home = "/app/home"');
    expect(action).toContain("revalidatePath(home)");
    expect(action).toContain("redirect(home)");
  });
});
