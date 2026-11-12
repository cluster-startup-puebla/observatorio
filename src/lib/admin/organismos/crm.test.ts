import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { crmSourceLabel } from "@/lib/crm-label";

describe("crm de un organismo", () => {
  it("traduce el origen y deja el estatus vacío en guion", () => {
    expect(crmSourceLabel("enlace")).toBe("Enlace");
    expect(crmSourceLabel("excel")).toBe("Excel");
    expect(crmSourceLabel("manual")).toBe("Manual");
    expect(crmSourceLabel("otro")).toBe("otro");
  });

  it("el CRM global puede limitarse a un organismo", () => {
    const source = readFileSync("src/lib/admin/crm/list.ts", "utf8");
    expect(source).toContain("organizationId");
    expect(source).toContain('.eq("organization_id", filters.organizationId)');
  });

  it("la ficha reutiliza el tablero del CRM", () => {
    const page = readFileSync("src/app/admin/organismos/[id]/page.tsx", "utf8");
    const board = readFileSync("src/app/admin/crm/crm-board.tsx", "utf8");
    const header = readFileSync("src/app/admin/organismos/[id]/organismo-header.tsx", "utf8");
    const screen = readFileSync("src/app/admin/organismos/[id]/tabs.tsx", "utf8");
    expect(page).toContain("listCrm");
    expect(page).toContain("organizationId: id");
    expect(page).toContain('all: vista === "tarjetas"');
    expect(board).toContain("CrmCards");
    expect(board).toContain("CrmToolbar");
    expect(board).toContain("CrmRowActions");
    expect(header).toContain("Contactos");
    expect(screen).not.toContain("data.contacts");
  });

  it("el tab CRM muestra el total y no descarga todas las filas", () => {
    const detail = readFileSync("src/lib/admin/organismos/detail.ts", "utf8");
    const nav = readFileSync("src/app/admin/organismos/[id]/organismo-screen.tsx", "utf8");
    expect(detail).toContain('{ count: "exact", head: true }');
    expect(detail).toContain("contactCount");
    expect(detail).not.toContain("nombre, empresa, email, source");
    expect(nav).toContain("data.contactCount");
  });
});
