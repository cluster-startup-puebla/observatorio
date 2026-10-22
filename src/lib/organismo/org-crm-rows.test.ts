import { describe, expect, it } from "vitest";
import { toCrmPeople } from "./org-crm-rows";

describe("filas del CRM en Supabase", () => {
  it("junta el estatus y el sector", () => {
    const people = toCrmPeople(
      [
        {
          id: "c1",
          nombre: "Rosa",
          empresa: "Taller",
          email: "rosa@taller.mx",
          sectors: { slug: "turismo" },
        },
      ],
      [{ contact_id: "c1", status: "cargado" }],
    );
    expect(people).toEqual([
      {
        id: "c1",
        nombre: "Rosa",
        empresa: "Taller",
        correo: "rosa@taller.mx",
        status: "cargado",
        sector: "turismo",
      },
    ]);
  });
});
