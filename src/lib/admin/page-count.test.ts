import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pageCount } from "./page-query";

describe("páginas de una tabla", () => {
  it("cuenta páginas de 20 y deja una página vacía en cero", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(17)).toBe(1);
    expect(pageCount(20)).toBe(1);
    expect(pageCount(21)).toBe(2);
    expect(pageCount(40)).toBe(2);
  });

  it("la lista pinta el total y no adivina otra página", () => {
    const source = readFileSync("src/components/admin/data-list.tsx", "utf8");
    expect(source).toContain("pageCount(total)");
    expect(source).toContain("total={total}");
    expect(source).toContain("limit={pageSize}");
    expect(source).not.toContain("rows.length");
    expect(source).toContain("router.replace");
  });

  it("cada pantalla del panel entrega el total a su lista", () => {
    const pages = [
      "src/app/admin/sectores/page.tsx",
      "src/app/admin/empresas/page.tsx",
      "src/app/admin/medios/page.tsx",
      "src/app/admin/metodologia/page.tsx",
      "src/app/admin/pases/page.tsx",
      "src/app/admin/bandeja/page.tsx",
      "src/app/admin/innovacion/page.tsx",
      "src/app/admin/invitaciones/page.tsx",
      "src/app/admin/cuentas/page.tsx",
      "src/app/admin/sesiones/page.tsx",
      "src/app/admin/organismos/page.tsx",
    ];
    for (const path of pages) {
      expect(readFileSync(path, "utf8")).toContain("total={data.total}");
    }
  });

  it("el CRM cuenta la consulta filtrada y el pie usa ese total", () => {
    const list = readFileSync("src/lib/admin/crm/list.ts", "utf8");
    const screen = readFileSync("src/app/admin/crm/crm-list.tsx", "utf8");
    const page = readFileSync("src/app/admin/crm/page.tsx", "utf8");
    expect(list).toContain('{ count: "exact" }');
    expect(list).toContain("total: 0");
    expect(list).toContain("total: contacts.count ?? 0");
    expect(screen).toContain("pageCount(total)");
    expect(screen).toContain("total={total}");
    expect(screen).not.toContain("rows.length >= 10");
    expect(page).toContain("total={data.total}");
  });

  it("la memoria de organismos devuelve el largo de la lista", () => {
    const memory = readFileSync("src/lib/admin/organismos/memory.ts", "utf8");
    expect(memory).toContain("total: all.length");
  });
});
