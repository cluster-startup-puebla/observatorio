import { describe, expect, it } from "vitest";
import { logoBox, logoRows } from "./footer-logos";

describe("marco del logo", () => {
  it("conserva la proporción y no aplasta una marca ancha", () => {
    const box = logoBox({ width: 1106, height: 253 });
    expect(box.width).toBeLessThanOrEqual(108);
    expect(box.width).toBeGreaterThan(box.height);
    expect(box.height).toBeGreaterThanOrEqual(20);
  });

  it("no estira una marca casi cuadrada a una franja", () => {
    const box = logoBox({ width: 339, height: 368 });
    expect(box.height).toBe(40);
    expect(box.width).toBeLessThan(box.height);
  });

  it("parte los convocantes en filas de cuatro", () => {
    expect(logoRows([1, 2, 3, 4, 5], 4)).toEqual([[1, 2, 3, 4], [5]]);
  });
});
