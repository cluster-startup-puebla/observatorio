import { describe, expect, it } from "vitest";
import { computeLavaAmount } from "./compute-amount";

describe("computeLavaAmount", () => {
  it("sin EIA devuelve base", () => {
    expect(
      computeLavaAmount({ base: 20, eiaBoost: true, isEia: false, multiplier: 1.5, flatBonus: 5 }),
    ).toBe(20);
  });

  it("con EIA aplica multiplicador y bono", () => {
    expect(
      computeLavaAmount({ base: 20, eiaBoost: true, isEia: true, multiplier: 1.5, flatBonus: 5 }),
    ).toBe(35);
  });

  it("acción sin flag de boost ignora EIA", () => {
    expect(
      computeLavaAmount({ base: 10, eiaBoost: false, isEia: true, multiplier: 2, flatBonus: 9 }),
    ).toBe(10);
  });
});
