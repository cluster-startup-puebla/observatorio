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

  it("la lista pagina los contactos de un organismo", () => {
    const source = readFileSync("src/lib/admin/organismos/crm.ts", "utf8");
    expect(source).toContain('.from("crm_contacts")');
    expect(source).toContain('.eq("organization_id", orgId)');
    expect(source).toContain('{ count: "exact" }');
    expect(source).toContain(".range(page.from, page.to)");
    expect(source).toContain("crm_contact_status");
    expect(source).toContain("crmSourceLabel");
    expect(source).toContain("crmLabel");
    expect(source).toContain('|| "—"');
  });

  it("la pestaña CRM abre el contacto y conserva el tab", () => {
    const tab = readFileSync("src/app/admin/organismos/[id]/crm-tab.tsx", "utf8");
    const page = readFileSync("src/app/admin/organismos/[id]/page.tsx", "utf8");
    const screen = readFileSync("src/app/admin/organismos/[id]/tabs.tsx", "utf8");
    expect(tab).toContain("href={`/admin/crm/${row.original.id}`}");
    expect(tab).toContain("Este organismo no tiene contactos.");
    expect(tab).toContain("?tab=crm&page=");
    expect(tab).not.toContain("deleteAction");
    expect(page).toContain("listOrganismoCrm");
    expect(page).toContain("OrganismoCrmTab");
    expect(screen).not.toContain("data.contacts");
  });

  it("el tab CRM muestra el total y no descarga todas las filas", () => {
    const detail = readFileSync("src/lib/admin/organismos/detail.ts", "utf8");
    const frame = readFileSync("src/components/admin/detail-frame.tsx", "utf8");
    const page = readFileSync("src/app/admin/organismos/[id]/page.tsx", "utf8");
    expect(detail).toContain('{ count: "exact", head: true }');
    expect(detail).toContain("contactCount");
    expect(detail).not.toContain("nombre, empresa, email, source");
    expect(frame).toContain("tab.count");
    expect(page).toContain("count: data.contactCount");
  });
});
