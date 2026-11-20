import { describe, expect, it } from "vitest";
import { LAVAS_TOOLTIP, lavasLabel } from "./lavas";

describe("lavas copy", () => {
  it("no vende lavas como camino a EIA", () => {
    expect(LAVAS_TOOLTIP.toLowerCase()).not.toContain("más cerca");
    expect(LAVAS_TOOLTIP.toLowerCase()).not.toContain("juntar");
    expect(lavasLabel(0)).toBe("0 lavas");
    expect(lavasLabel(1)).toBe("1 lava");
    expect(lavasLabel(12)).toBe("12 lavas");
  });
});
