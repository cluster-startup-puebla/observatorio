import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lista de innovación abierta", () => {
  it("el superadmin ve quién aceptó y la consulta no lee el token", () => {
    const list = readFileSync("src/lib/admin/innovacion/list.ts", "utf8");
    const page = readFileSync("src/app/admin/innovacion/page.tsx", "utf8");
    const nav = readFileSync("src/components/admin/nav.ts", "utf8");
    expect(list).toContain('.select("profile_id, accepted_at")');
    expect(list).toContain('.not("accepted_at", "is", null)');
    expect(list).not.toContain("token");
    expect(page).toContain("requireSuperadmin");
    expect(page).toContain("InnovacionList");
    expect(nav).toContain('{ href: "/admin/innovacion", label: "Innovación abierta", group: "Operación" }');
  });
});
