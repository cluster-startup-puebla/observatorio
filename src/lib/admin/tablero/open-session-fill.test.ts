import { describe, expect, it } from "vitest";
import { openSessionFill } from "./open-session-fill";

describe("openSessionFill", () => {
  it("usa capacity_max como cupo global y no marca omitidos", () => {
    const fill = openSessionFill(50, [
      { sectorSlug: "a", sectorName: "A", status: "confirmed", released: false },
      { sectorSlug: "b", sectorName: "B", status: "pending", released: false },
      { sectorSlug: "c", sectorName: "C", status: "confirmed", released: true },
    ]);
    expect(fill.cupo).toBe(50);
    expect(fill.ocupados).toBe(1);
    expect(fill.pendientes).toBe(1);
    expect(fill.omitidos).toEqual([]);
    expect(fill.rows[0]).toMatchObject({ slug: "sesion", ocupados: 1, pendientes: 1, cupo: 50 });
  });
});
