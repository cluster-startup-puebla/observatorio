import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lista de sesiones", () => {
  it("lee la sesión y marca cuál es la vigente", () => {
    const list = readFileSync("src/lib/admin/sesiones/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/sesiones/route.ts", "utf8");
    expect(list).toContain('.from("sessions")');
    expect(list).toContain("venue");
    expect(list).toContain("format_name");
    expect(list).toContain("starts_local");
    expect(list).toContain("ends_local");
    expect(list).toContain("is_current");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
