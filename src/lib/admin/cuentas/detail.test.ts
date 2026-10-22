import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { roleChange } from "./role-change";

describe("detalle de cuentas", () => {
  it("cambiar rol respeta el organismo y no borra el perfil", () => {
    expect(roleChange({ role: "moderador", organizationId: "org-1" })).toEqual({
      ok: false,
      reason: "ese rol no lleva organismo",
    });
    expect(roleChange({ role: "capturista", organizationId: "" })).toEqual({
      ok: false,
      reason: "ese rol exige organismo",
    });
    expect(roleChange({ role: "invitador", organizationId: "org-1" })).toEqual({
      ok: true,
      role: "invitador",
      organizationId: "org-1",
    });
    expect(roleChange({ role: "empresario", organizationId: "" })).toEqual({
      ok: true,
      role: "empresario",
      organizationId: null,
    });
    expect(roleChange({ role: "otro", organizationId: "" }).ok).toBe(false);
  });

  it("el detalle trae empresa, pase, respuestas y correos", () => {
    const source = readFileSync("src/lib/admin/cuentas/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/cuentas/[id]/route.ts", "utf8");
    expect(source).toContain('.from("companies")');
    expect(source).toContain('.from("passes")');
    expect(source).toContain('.from("response_choices")');
    expect(source).toContain('.from("outbox_messages")');
    expect(source).not.toContain("password");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
