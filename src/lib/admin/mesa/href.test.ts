import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adminLinks } from "@/components/admin/nav";
import { mesaHref } from "./href";

describe("mesa del panel", () => {
  it("usa el href que el sidebar ya tiene", () => {
    expect(mesaHref).toBe("/mesa");
    expect(adminLinks.find((link) => link.label === "Mesa")?.href).toBe(mesaHref);
  });

  it("la página conserva el escaneo del e2e", () => {
    const page = readFileSync("src/app/mesa/page.tsx", "utf8");
    expect(page).toContain("scanDeskAction");
    expect(page).toContain("Código QR");
    expect(page).toContain("Registrar llegada");
    expect(page).toContain('data-testid="bienvenida"');
    expect(page).toContain('data-testid="estatus"');
    expect(page).not.toContain("requireSuperadmin");
  });
});
