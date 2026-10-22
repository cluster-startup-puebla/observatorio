import { describe, expect, it } from "vitest";
import { filterOrgCrm, orgView } from "./crm-view";

const rows = [
  { id: "1", status: "cargado" },
  { id: "2", status: "contactado" },
  { id: "3", status: "confirmo" },
  { id: "4", status: "no" },
];

describe("vista del CRM", () => {
  it("filtra las tres cubetas y esconde el no", () => {
    expect(filterOrgCrm(rows, "pendiente").map((row) => row.id)).toEqual(["1"]);
    expect(filterOrgCrm(rows, "contactado").map((row) => row.id)).toEqual(["2"]);
    expect(filterOrgCrm(rows, "confirmado").map((row) => row.id)).toEqual(["3"]);
    expect(filterOrgCrm(rows, undefined).map((row) => row.id)).toEqual(["1", "2", "3"]);
  });

  it("la vista desconocida cae en tabla", () => {
    expect(orgView("tarjetas")).toBe("tarjetas");
    expect(orgView("tabla")).toBe("tabla");
    expect(orgView("kanban")).toBe("tabla");
    expect(orgView(undefined)).toBe("tabla");
  });
});
