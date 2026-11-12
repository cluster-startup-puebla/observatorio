import { describe, expect, it } from "vitest";
import { pathPendingRows } from "./path-pending";
import { safeAdminNext } from "./safe-admin-next";

const ready = {
  id: "company-1",
  legal_name: "Sabia",
  admitted_at: null,
  sectors: { name: "Dispositivos médicos" },
  owner: { full_name: "Alvaro", onboarded_at: "2026-11-12", role: "empresario" },
};

describe("registros solos por aceptar", () => {
  it("incluye a quien terminó el perfil y nadie ha aceptado", () => {
    expect(pathPendingRows([ready])).toEqual([
      { id: "company-1", nombre: "Alvaro", empresa: "Sabia", sector: "Dispositivos médicos" },
    ]);
  });

  it("deja fuera a quien no terminó, ya fue aceptado o no es empresario", () => {
    expect(pathPendingRows([
      { ...ready, id: "a", owner: { ...ready.owner, onboarded_at: null } },
      { ...ready, id: "b", admitted_at: "2026-11-12" },
      { ...ready, id: "c", owner: { ...ready.owner, role: "director" } },
    ])).toEqual([]);
  });
});

describe("regreso después de aceptar", () => {
  it("solo vuelve a una ruta del panel", () => {
    expect(safeAdminNext("/admin/crm?vista=tarjetas", "/admin/empresas/1")).toBe("/admin/crm?vista=tarjetas");
    expect(safeAdminNext("https://otro.example/admin", "/admin/empresas/1")).toBe("/admin/empresas/1");
  });
});
