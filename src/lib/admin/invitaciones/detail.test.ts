import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { manualInvite } from "./manual";

describe("detalle de invitaciones", () => {
  it("el alta a mano queda en source manual y cargar", () => {
    expect(manualInvite({ nombre: "Luis", empresa: "Sur", correo: "luis@sur.mx", organizationId: "org-1" })).toEqual({
      ok: true,
      contact: {
        organization_id: "org-1",
        nombre: "Luis",
        empresa: "Sur",
        email: "luis@sur.mx",
        source: "manual",
        event: "cargar",
      },
    });
    expect(manualInvite({ nombre: "", empresa: "Sur", correo: "luis@sur.mx", organizationId: "org-1" }).ok).toBe(false);
  });

  it("confirmar escribe el hecho y no una columna status", () => {
    const source = readFileSync("src/app/api/admin/invitaciones/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("confirmar");
    expect(source).toContain('.from("crm_events")');
    expect(source).not.toContain("status:");
    expect(source).not.toMatch(/export async function DELETE/);
  });
});
