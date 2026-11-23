import { describe, expect, it } from "vitest";
import { adminGroups } from "@/components/admin/nav";
import { bestMatchingHref, openGroupName } from "@/components/admin/nav-match";

const groups = adminGroups();
const hrefs = groups.flatMap((group) => group.links.map((link) => link.href));

describe("nav match", () => {
  it("abre el grupo del listado en la ruta y en el detalle", () => {
    const cases = [
      ["/admin/cuentas", "Directorio", "/admin/cuentas"],
      ["/admin/logo", "Directorio", "/admin/logo"],
      ["/admin/cuentas/360ab36d-9882-44c6-9b61-1010b9aab795", "Directorio", "/admin/cuentas"],
      ["/admin/metodologia/integral", "Programa", "/admin/metodologia"],
      ["/admin/metodologia/abc", "Programa", "/admin/metodologia"],
      ["/admin/correo/abc", "Comunicación", "/admin/correo"],
      ["/admin/bandeja", "Comunicación", "/admin/bandeja"],
      ["/admin/innovacion", "Participación", "/admin/innovacion"],
      ["/admin/mesa", "Dashboard", "/admin/mesa"],
      ["/admin/mesa/profile-1", "Dashboard", "/admin/mesa"],
      ["/admin", "Dashboard", "/admin"],
      ["/admin/registros", "Embudo", "/admin/registros"],
      ["/admin/pases", "Dashboard", "/admin/pases"],
    ] as const;

    for (const [path, group, href] of cases) {
      expect(openGroupName(path, groups)).toBe(group);
      expect(bestMatchingHref(path, hrefs)).toBe(href);
    }
  });

  it("no trata /admin como padre de las demás rutas", () => {
    expect(bestMatchingHref("/admin/cuentas", hrefs)).toBe("/admin/cuentas");
    expect(bestMatchingHref("/admin/bandeja", hrefs)).not.toBe("/admin");
  });
});
