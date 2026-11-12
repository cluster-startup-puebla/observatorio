import { describe, expect, it } from "vitest";
import { crmHref, crmVista, organismoCrmHref } from "./query";

describe("consulta del CRM", () => {
  it("separa vista y filtros en la url", () => {
    expect(crmVista("tarjetas")).toBe("tarjetas");
    expect(crmHref({ vista: "tarjetas", estado: "cargado", origen: "excel" })).toBe(
      "/admin/crm?vista=tarjetas&estado=cargado&origen=excel",
    );
    expect(crmHref({})).toBe("/admin/crm");
    expect(organismoCrmHref("org-1", { vista: "tarjetas", page: 2 })).toBe(
      "/admin/organismos/org-1?vista=tarjetas&page=2&tab=crm",
    );
  });
});
