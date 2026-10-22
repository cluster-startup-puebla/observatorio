import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { roleForSignup } from "@/lib/supabase/auth";
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
    expect(list).toContain('.from("profiles")');
    expect(list).toContain("full_name");
    expect(list).toContain("email");
    expect(list).toContain("role");
    expect(list).toContain(".range(page.from, page.to)");
    expect(list).not.toContain("password");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
