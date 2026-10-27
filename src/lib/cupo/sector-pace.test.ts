import { describe, expect, it } from "vitest";
import { sectorPace } from "./sector-pace";

describe("medidor del sector", () => {
  it("parte los aceptados de este organismo y los demás", () => {
    expect(sectorPace({ capacity: 20, mine: 6, others: 9 })).toEqual({
      open: true,
      capacity: 20,
      mine: 6,
      others: 9,
      filled: 15,
      free: 5,
      full: false,
    });
  });

  it("marca lleno cuando la suma llega al cupo y no deja libres negativos", () => {
    expect(sectorPace({ capacity: 20, mine: 10, others: 12 })).toMatchObject({
      filled: 22,
      free: 0,
      full: true,
    });
  });

  it("sin cupo no inventa una barra", () => {
    expect(sectorPace({ capacity: null, mine: 0, others: 0 })).toEqual({ open: false });
    expect(sectorPace({ capacity: 0, mine: 1, others: 0 })).toEqual({ open: false });
  });
});
