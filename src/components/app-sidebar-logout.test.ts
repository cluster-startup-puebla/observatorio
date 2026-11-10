import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Salir del sidebar", () => {
  it("el organismo pide la puerta de inicio", () => {
    const shell = readFileSync("src/components/organismo/shell.tsx", "utf8");
    expect(shell).toContain('logout="home"');
  });

  it("el superadmin no pide esa puerta", () => {
    const shell = readFileSync("src/components/admin/shell.tsx", "utf8");
    expect(shell).not.toContain('logout="home"');
    expect(shell).not.toContain("logoutHomeAction");
  });

  it("el botón elige la acción según la puerta", () => {
    const source = readFileSync("src/components/app-sidebar-logout.tsx", "utf8");
    expect(source).toContain('door === "home" ? logoutHomeAction : logoutAdminAction');
    expect(source).toContain("Salir");
  });

  it("el sidebar del organismo conserva el cierre del superadmin", () => {
    const admin = readFileSync("src/lib/admin-actions.ts", "utf8");
    expect(admin).toContain('redirect("/admin/login")');
  });
});
