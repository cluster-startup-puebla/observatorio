import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { whatsappHref } from "./whatsapp";

describe("ficha de la persona", () => {
  it("arma el enlace de WhatsApp con lada de México cuando son 10 dígitos", () => {
    expect(whatsappHref("222 123 4567")).toBe("https://wa.me/522221234567");
    expect(whatsappHref("522221234567")).toBe("https://wa.me/522221234567");
    expect(whatsappHref("")).toBe("");
  });

  it("junta el perfil, la empresa y el organismo", () => {
    const source = readFileSync("src/lib/admin/crm/person.ts", "utf8");
    const page = readFileSync("src/app/admin/crm/[id]/page.tsx", "utf8");
    const ficha = readFileSync("src/app/admin/crm/[id]/contacto-ficha.tsx", "utf8");
    expect(source).toContain("job_title");
    expect(source).toContain("whatsapp");
    expect(source).toContain("session_interest");
    expect(source).toContain("municipality");
    expect(source).toContain('eq("profile_id", profile.data.id)');
    expect(source).toContain("/admin/empresas/");
    expect(page).toContain("ContactoHeader");
    expect(ficha).toContain("WhatsApp");
    expect(ficha).toContain("Qué le interesa");
  });
});