import { describe, expect, it } from "vitest";
import { sectorChartRows } from "./sector-chart-rows";

describe("filas de la gráfica por sector", () => {
  it("agrega al final a quien se registró fuera de la lista, con cupo en cero", () => {
    const rows = sectorChartRows(
      [{ sector: "Turismo", slug: "turismo", cupo: 10, ocupados: 2, pendientes: 1 }],
      [{ sector: "Textil", slug: "textil", personas: 3, pendientes: 1 }],
    );
    expect(rows).toEqual([
      { sector: "Turismo", slug: "turismo", cupo: 10, ocupados: 2, pendientes: 1 },
      { sector: "Textil", slug: "textil", cupo: 0, ocupados: 2, pendientes: 1 },
    ]);
  });
});
