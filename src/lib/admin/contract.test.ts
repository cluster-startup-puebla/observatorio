import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pageQuery } from "./page-query";
import { tabQuery } from "./tab-query";

describe("contrato del panel", () => {
  it("pide 10 filas y un tab desconocido cae al primero", () => {
    expect(pageQuery(undefined)).toEqual({ page: 1, from: 0, to: 9, size: 10 });
    expect(pageQuery("2")).toEqual({ page: 2, from: 10, to: 19, size: 10 });
    expect(pageQuery("0")).toEqual({ page: 1, from: 0, to: 9, size: 10 });
    expect(pageQuery("no")).toEqual({ page: 1, from: 0, to: 9, size: 10 });
    expect(tabQuery("crm", ["miembros", "crm"], "miembros")).toBe("crm");
    expect(tabQuery("borrar", ["miembros", "crm"], "miembros")).toBe("miembros");
    expect(tabQuery(undefined, ["empresa", "pase"], "empresa")).toBe("empresa");
  });

  it("el handler del panel llama a requireSuperadmin", () => {
    const source = readFileSync("src/app/api/admin/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("pageQuery");
    expect(source).not.toMatch(/export async function DELETE/);
  });
});
