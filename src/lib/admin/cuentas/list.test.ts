import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { roleForSignup } from "@/lib/supabase/auth";
import { cuentaDisplayName, cuentaMarkSrc, orgHasLogo } from "./cuenta-row";
import { staffDraft } from "./staff-draft";

describe("lista de cuentas", () => {
  it("el panel crea staff y el alta pública no", () => {
    expect(roleForSignup("moderador")).toBe("empresario");
    expect(roleForSignup("capturista")).toBe("empresario");
    expect(roleForSignup("invitador")).toBe("empresario");
    expect(roleForSignup("superadmin")).toBe("empresario");
    expect(staffDraft({ role: "moderador", organizationId: "" })).toEqual({
      ok: true,
      role: "moderador",
      organizationId: null,
    });
    expect(staffDraft({ role: "capturista", organizationId: "" })).toEqual({
      ok: false,
      reason: "ese rol exige organismo",
    });
    expect(staffDraft({ role: "invitador", organizationId: "org-1" })).toEqual({
      ok: true,
      role: "invitador",
      organizationId: "org-1",
    });
    expect(staffDraft({ role: "superadmin", organizationId: "" }).ok).toBe(false);
    expect(staffDraft({ role: "empresario", organizationId: "" }).ok).toBe(false);
    expect(staffDraft({ role: "director", organizationId: "org-1" }).ok).toBe(false);
  });

  it("la lista lee profiles y el handler no borra", () => {
    const list = readFileSync("src/lib/admin/cuentas/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/cuentas/route.ts", "utf8");
    const create = readFileSync("src/lib/admin/cuentas/create-staff.ts", "utf8");
    expect(list).toContain('.from("profiles")');
    expect(list).toContain("full_name");
    expect(list).toContain("email");
    expect(list).toContain("role");
    expect(list).toContain(".range(page.from, page.to)");
    expect(list).toContain('{ count: "exact" }');
    expect(list).not.toContain("password");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
    expect(create).toContain('rpc("create_staff_account"');
    expect(create).not.toContain("createSupabaseAdmin");
    expect(list).toContain("display_name");
    expect(list).toContain("orgHasLogo");
    expect(list).toContain("media_assets(purpose)");
    const screen = readFileSync("src/app/admin/cuentas/cuentas-list.tsx", "utf8");
    expect(screen.indexOf('key: "logo"')).toBeLessThan(screen.indexOf('key: "display_name"'));
    expect(screen).toContain("RolePillow");
    expect(screen).toContain("CuentaMark");
  });

  it("sin nombre propio usa el del organismo y el logo solo si existe", () => {
    expect(cuentaDisplayName("", "CANACINTRA Puebla")).toBe("CANACINTRA Puebla");
    expect(cuentaDisplayName("Rubén Araujo", "CANACINTRA Puebla")).toBe("Rubén Araujo");
    expect(cuentaDisplayName("  ", "")).toBe("—");
    expect(orgHasLogo([{ purpose: "organization_logo" }])).toBe(true);
    expect(orgHasLogo(null)).toBe(false);
    expect(cuentaMarkSrc("org-1", true)).toBe("/api/admin/organismos/org-1/logo");
    expect(cuentaMarkSrc("org-1", false)).toBe("");
  });
});

