import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inviteSave, invitesFromSheet } from "./sheet";

describe("lista de invitaciones", () => {
  it("el excel entra como source excel y el hecho cargar", () => {
    const parsed = invitesFromSheet(
      [
        ["nombre", "empresa", "correo"],
        ["Ana", "Norte", "ana@norte.mx"],
      ],
      "org-1",
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.contacts).toEqual([
      {
        organization_id: "org-1",
        nombre: "Ana",
        empresa: "Norte",
        email: "ana@norte.mx",
        source: "excel",
        event: "cargar",
      },
    ]);
    expect(invitesFromSheet([["mal"]], "org-1").contacts).toEqual([]);
    expect(inviteSave(false)).toBe("insert");
    expect(inviteSave(true)).toBe("update");
  });

  it("la lista filtra excel y manual", () => {
    const list = readFileSync("src/lib/admin/invitaciones/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/invitaciones/route.ts", "utf8");
    expect(list).toContain('.from("crm_contacts")');
    expect(list).toContain('"excel"');
    expect(list).toContain('"manual"');
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
