import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { invitesFromEmails } from "./email-list";

describe("correos sueltos", () => {
  it("arma filas y reporta el resto", () => {
    const parsed = invitesFromEmails("Ana@Norte.mx\nana@norte.mx\nno-es-correo\n\nbeto@sur.mx");
    expect(parsed.ok).toEqual([
      { nombre: "Ana", empresa: "Por confirmar", correo: "ana@norte.mx" },
      { nombre: "Beto", empresa: "Por confirmar", correo: "beto@sur.mx" },
    ]);
    expect(parsed.errors).toEqual([
      { row: 2, reason: "correo repetido" },
      { row: 3, reason: "correo inválido" },
    ]);
  });

  it("las acciones redirigen al CRM del slug", () => {
    const source = readFileSync("src/lib/organismo-actions.ts", "utf8");
    expect(source).toContain("ownerBySlug");
    expect(source).toContain("toCrm(owner.slug)");
    expect(source).not.toContain('redirect("/organismo/crm")');
    expect(source).toContain("invitesFromEmails");
  });
});
