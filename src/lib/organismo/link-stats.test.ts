import { describe, expect, it } from "vitest";
import { linkStats } from "./link-stats";

describe("cifras del enlace", () => {
  it("cuenta aperturas, conversiones y 14 días", () => {
    const now = new Date("2026-10-22T18:00:00.000Z");
    const stats = linkStats({
      opens: [
        { at: "2026-10-22T15:00:00.000Z" },
        { at: "2026-10-22T16:00:00.000Z" },
        { at: "2026-10-01T16:00:00.000Z" },
      ],
      conversions: 1,
      now,
    });
    expect(stats.opens).toBe(3);
    expect(stats.conversions).toBe(1);
    expect(stats.rate).toBe(33);
    expect(stats.bars).toHaveLength(14);
    expect(stats.bars[13]).toMatchObject({ aperturas: 2 });
    expect(stats.bars[0].aperturas).toBe(0);
  });

  it("la tasa es 0 si nadie abrió", () => {
    const stats = linkStats({ opens: [], conversions: 4, now: new Date("2026-10-22T18:00:00.000Z") });
    expect(stats.rate).toBe(0);
    expect(stats.conversions).toBe(4);
  });
});
