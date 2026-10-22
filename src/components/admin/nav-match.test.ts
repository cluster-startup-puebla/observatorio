import { describe, expect, it } from "vitest";
import { adminGroups } from "@/components/admin/nav";
import { bestMatchingHref, openGroupName } from "@/components/admin/nav-match";

const groups = adminGroups();
const hrefs = groups.flatMap((group) => group.links.map((link) => link.href));

describe("nav match", () => {
  it("abre el grupo del listado en la ruta y en el detalle", () => {
    const cases = [
      ["/admin/cuentas", "Directorio", "/admin/cuentas"],
      ["/admin/cuentas/360ab36d-9882-44c6-9b61-1010b9aab795", "Directorio", "/admin/cuentas"],
      ["/admin/metodologia/integral", "Contenido", "/admin/metodologia"],
      ["/admin/metodologia/abc", "Contenido", "/admin/metodologia"],
      ["/admin/correo/abc", "Operación", "/admin/correo"],
      ["/mesa", "Operación", "/mesa"],
      ["/mesa/profile-1", "Operación", "/mesa"],
      ["/admin", "Operación", "/admin"],
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
