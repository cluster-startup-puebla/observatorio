import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adminLinks } from "@/components/admin/nav";
import { mesaHref } from "./href";

describe("mesa del panel", () => {
  it("usa el href que el sidebar ya tiene", () => {
    expect(mesaHref).toBe("/admin/mesa");
    expect(adminLinks.find((link) => link.label === "Mesa")?.href).toBe(mesaHref);
  });

  it("la página conserva el escaneo del e2e", () => {
    const page = readFileSync("src/app/admin/mesa/page.tsx", "utf8");
    const desk = readFileSync("src/components/mesa/mesa-desk.tsx", "utf8");
    const dialog = readFileSync("src/components/mesa/arrival-dialog.tsx", "utf8");
    expect(desk).toContain("scanDeskAction");
    expect(page).not.toContain("Código QR");
    expect(page).not.toContain("Volver al panel");
    expect(dialog).toContain('data-testid="bienvenida"');
    expect(dialog).toContain('data-testid="estatus"');
    expect(page).not.toContain("requireSuperadmin");
  });
});
