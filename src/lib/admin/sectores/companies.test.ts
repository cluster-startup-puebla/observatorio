import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("empresas de un sector", () => {
  const source = readFileSync("src/lib/admin/sectores/companies.ts", "utf8");

  it("busca el sector por slug y pagina sus empresas", () => {
    expect(source).toContain('.from("sectors")');
    expect(source).toContain('.eq("slug", slug)');
    expect(source).toContain('.from("companies")');
    expect(source).toContain('.eq("sector_id", sector.data.id)');
    expect(source).toContain('.order("legal_name")');
    expect(source).toContain(".range(page.from, page.to)");
    expect(source).toContain('{ count: "exact" }');
    expect(source).toContain("toEmpresaRow");
    expect(source).not.toContain("session_sector_quotas");
  });

  it("la página del módulo abre el sector y conserva el módulo", () => {
    const page = readFileSync("src/app/admin/[modulo]/page.tsx", "utf8");
    const screen = readFileSync("src/app/admin/[modulo]/sector-companies.tsx", "utf8");
    expect(page).toContain("export const instant = false");
    expect(page).toContain("adminSegment");
    expect(page).toContain("listSectorCompanies");
    expect(page).toContain("notFound()");
    expect(screen).toContain("href={`/admin/empresas/${row.id}`}");
    expect(screen).toContain("Razón social");
    expect(screen).not.toContain('label: "Sector"');
  });
});
