import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bandLabel } from "./band-label";

describe("lista de empresas", () => {
  it("traduce la banda guardada", () => {
    expect(bandLabel("1_10")).toBe("1–10");
    expect(bandLabel("11_50")).toBe("11–50");
    expect(bandLabel("51_250")).toBe("51–250");
    expect(bandLabel("250_plus")).toBe("250+");
    expect(bandLabel("otra")).toBe("");
  });

  it("la lista lee companies y el tamaño", () => {
    const list = [
      readFileSync("src/lib/admin/empresas/list.ts", "utf8"),
      readFileSync("src/lib/admin/empresas/empresa-row.ts", "utf8"),
    ].join("\n");
    const route = readFileSync("src/app/api/admin/empresas/route.ts", "utf8");
    expect(list).toContain('.from("companies")');
    expect(list).toContain("legal_name");
    expect(list).toContain("employee_band");
    expect(list).toContain("admitted_at");
    expect(list).toContain("externalApprovalLabel");
    expect(list).toContain("sectorSourceLabel");
    expect(list).toContain("sector_id");
    expect(list).toContain(".range(page.from, page.to)");
    expect(list).toContain('{ count: "exact" }');
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
    expect(list).toContain("profile_id");
    expect(list).toContain('.from("media_assets")');
    expect(list).toContain('eq("purpose", "company_logo")');
    expect(list).toContain("companyLogoSrc");
    expect(list).not.toContain("media_assets(");
    expect(list).toContain("loadLinkContacts");
    const links = readFileSync("src/lib/admin/empresas/link-contacts.ts", "utf8");
    const screen = readFileSync("src/app/admin/empresas/empresas-list.tsx", "utf8");
    const logo = screen.indexOf('{ key: "logo", label: "Logo", image: true }');
    const name = screen.indexOf('{ key: "legal_name", label: "Razón social" }');
    expect(logo).toBeGreaterThan(-1);
    expect(logo).toBeLessThan(name);
    expect(links).toContain('eq("source", "enlace")');
    expect(links).toContain("organizations(name)");
    expect(links).toContain("crm_contact_status");
    expect(links).toContain("organization_id");
    expect(links).toContain("convenerHrefs");
    expect(list).toContain("links.hrefs");
    expect(list).toContain("ownerEmail");
    expect(list).not.toContain("crm_contacts(");
    expect(links).not.toContain("crm_contacts(");
    const convoco = screen.indexOf('{ key: "convoco", label: "Convocó", links: true }');
    const columns = readFileSync("src/components/admin/data-columns.tsx", "utf8");
    expect(columns).toContain("column.links");
    expect(columns).toContain('className="text-link"');
    const llegada = screen.indexOf('{ key: "llegada", label: "Llegada" }');
    expect(convoco).toBeGreaterThan(-1);
    expect(convoco).toBeLessThan(llegada);
  });
});
