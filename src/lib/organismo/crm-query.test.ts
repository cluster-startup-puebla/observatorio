import { describe, expect, it } from "vitest";
import { crmHref, resolveCrmSessionId } from "./crm-query";

describe("crm query", () => {
  it("resuelve sesión desde query, todas o ruta", () => {
    expect(resolveCrmSessionId("todas", "route")).toBeNull();
    expect(resolveCrmSessionId("abc", "route")).toBe("abc");
    expect(resolveCrmSessionId(undefined, "route")).toBe("route");
    expect(resolveCrmSessionId(undefined, null)).toBeNull();
  });

  it("arma href conservando vista, estado y sesión", () => {
    expect(crmHref({ vista: "tabla", estado: "pendiente", sesion: "todas" })).toBe(
      "?vista=tabla&estado=pendiente&sesion=todas",
    );
    expect(crmHref({ vista: "tarjetas" })).toBe("?vista=tarjetas");
  });
});
