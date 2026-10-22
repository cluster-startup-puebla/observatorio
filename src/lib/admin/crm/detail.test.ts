import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nextCrmInsert } from "./next-event";

describe("detalle de CRM", () => {
  it("contactar, rechazar, confirmar, registrar y llegar insertan un hecho", () => {
    expect(nextCrmInsert("cargado", "contactar")).toEqual({ ok: true, event: "contactar" });
    expect(nextCrmInsert("cargado", "rechazar")).toEqual({ ok: true, event: "rechazar" });
    expect(nextCrmInsert("contactado", "confirmar")).toEqual({ ok: true, event: "confirmar" });
    expect(nextCrmInsert("confirmo", "registrar")).toEqual({ ok: true, event: "registrar" });
    expect(nextCrmInsert("registrado", "llegar")).toEqual({ ok: true, event: "llegar" });
    expect(nextCrmInsert("cargado", "llegar")).toEqual({ ok: false, reason: "transición inválida" });
    expect(nextCrmInsert("llego", "rechazar").ok).toBe(false);
    const allowed = nextCrmInsert("cargado", "contactar");
    expect(allowed).not.toHaveProperty("status");
  });

  it("el handler inserta crm_events y no actualiza el contacto", () => {
    const source = readFileSync("src/app/api/admin/crm/[id]/evento/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain('.from("crm_events")');
    expect(source).toContain(".insert(");
    expect(source).not.toContain('.from("crm_contacts").update');
    expect(source).not.toMatch(/export async function DELETE/);
  });
});
