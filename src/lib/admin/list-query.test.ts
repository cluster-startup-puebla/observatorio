import { describe, expect, it } from "vitest";
import { listHref, listQueryQ } from "./list-query";

describe("list query", () => {
  it("normaliza q y arma href sin tirar la búsqueda", () => {
    expect(listQueryQ(undefined)).toBe("");
    expect(listQueryQ("  Ana  ")).toBe("Ana");
    expect(listQueryQ("Ana, Luis")).toBe("Ana Luis");
    expect(listHref({ basePath: "/admin/cuentas", page: 1 })).toBe("/admin/cuentas");
    expect(listHref({ basePath: "/admin/cuentas", page: 2, q: "Ana" })).toBe(
      "/admin/cuentas?q=Ana&page=2",
    );
    expect(listHref({ basePath: "/admin/empresas", page: 1, q: "Capleton" })).toBe(
      "/admin/empresas?q=Capleton",
    );
  });
});
