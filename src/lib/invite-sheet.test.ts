import { describe, expect, it } from "vitest";
import { inviteTemplateCsv, parseInviteSheet } from "./invite-sheet";

describe("parseInviteSheet", () => {
  it("entrega la plantilla con tres columnas", () => {
    expect(inviteTemplateCsv()).toBe("nombre,empresa,correo\n");
  });

  it("acepta filas completas y rechaza el resto", () => {
    const result = parseInviteSheet([
      ["nombre", "empresa", "correo"],
      ["Ana López", "Talleres Norte", "ana@norte.mx"],
      ["", "Sin nombre", "vacio@norte.mx"],
      ["Beto Ruiz", "Ruiz", "no-es-correo"],
      ["Ana otra", "Otra", "ana@norte.mx"],
    ]);
    expect(result.ok).toEqual([
      { nombre: "Ana López", empresa: "Talleres Norte", correo: "ana@norte.mx" },
    ]);
    expect(result.errors.map((error) => error.reason)).toEqual([
      "nombre, empresa y correo son obligatorios",
      "correo inválido",
      "correo repetido",
    ]);
  });

  it("rechaza un encabezado distinto", () => {
    expect(parseInviteSheet([["email", "name"]]).ok).toEqual([]);
    expect(parseInviteSheet([["email", "name"]]).errors[0].row).toBe(1);
  });

  it("normaliza encabezado y correo, y no acepta la hoja vacía", () => {
    const result = parseInviteSheet([
      [" Nombre ", "EMPRESA", "Correo"],
      ["  Ana  ", " Norte ", " Ana@Norte.mx "],
      ["Beto", "Sur", "ANA@norte.mx"],
      ["   ", "   ", "   "],
    ]);
    expect(result.ok).toEqual([{ nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" }]);
    expect(result.errors.map((error) => error.reason)).toEqual([
      "correo repetido",
      "nombre, empresa y correo son obligatorios",
    ]);
    expect(parseInviteSheet([]).errors[0]).toEqual({
      row: 1,
      reason: "el encabezado debe ser nombre, empresa, correo",
    });
    expect(parseInviteSheet([["nombre", "empresa", "correo"]])).toEqual({ ok: [], errors: [] });
  });
});
