import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { crmSourceLabel } from "@/lib/crm-label";

describe("crm de un organismo", () => {
  it("traduce el origen y deja el estatus vacío en guion", () => {
    expect(crmSourceLabel("enlace")).toBe("Enlace");
    expect(crmSourceLabel("excel")).toBe("Excel");
    expect(crmSourceLabel("manual")).toBe("Manual");
    expect(crmSourceLabel("otro")).toBe("otro");
  });

  it("la lista pagina los contactos de un organismo", () => {
    const source = readFileSync("src/lib/admin/organismos/crm.ts", "utf8");
    expect(source).toContain('.from("crm_contacts")');
    expect(source).toContain('.eq("organization_id", orgId)');
    expect(source).toContain('{ count: "exact" }');
    expect(source).toContain(".range(page.from, page.to)");
    expect(source).toContain("crm_contact_status");
    expect(source).toContain("crmSourceLabel");
    expect(source).toContain("crmLabel");
    expect(source).toContain('|| "—"');
  });
});
