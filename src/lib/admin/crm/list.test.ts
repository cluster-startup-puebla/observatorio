import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { attachStatus } from "./attach-status";

describe("lista de CRM", () => {
  it("el estatus sale del último hecho, no del contacto", () => {
    const rows = attachStatus(
      [{ id: "c1", email: "ana@norte.mx" }, { id: "c2", email: "sin@hecho.mx" }],
      [{ contact_id: "c1", status: "cargado" }],
    );
    expect(rows).toEqual([
      { id: "c1", email: "ana@norte.mx", status: "cargado" },
      { id: "c2", email: "sin@hecho.mx", status: "" },
    ]);
    expect(rows[0]).not.toHaveProperty("deleted");
  });

  it("la lista no escribe status en crm_contacts", () => {
    const list = readFileSync("src/lib/admin/crm/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/crm/route.ts", "utf8");
    expect(list).toContain('.from("crm_contacts")');
    expect(list).toContain('.from("crm_contact_status")');
    expect(list).toContain("nombre");
    expect(list).toContain("empresa");
    expect(list).toContain("email");
    expect(list).toContain("source");
    expect(list).not.toContain(".update(");
    expect(route).toContain("await requireSuperadmin()");
  });
});
