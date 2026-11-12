import { describe, expect, it } from "vitest";
import { orgOpenBars } from "./org-open-bars";

describe("aperturas por organismo", () => {
  it("suma el día sin importar el sector y deja en cero a quien no abrió", () => {
    const now = new Date("2026-10-22T18:00:00.000Z");
    const result = orgOpenBars({
      orgs: [
        { id: "b", name: "Beta" },
        { id: "a", name: "Alfa" },
      ],
      opens: [
        { organizationId: "a", at: "2026-10-22T15:00:00.000Z" },
        { organizationId: "a", at: "2026-10-22T16:00:00.000Z" },
        { organizationId: "a", at: "2026-09-01T16:00:00.000Z" },
      ],
      now,
    });
    expect(result.bars).toHaveLength(14);
    expect(result.series).toEqual([{ key: "o0", name: "Alfa", total: 2 }]);
    expect(result.bars[13]).toMatchObject({ o0: 2 });
    expect(result.series.some((item) => item.name === "Beta")).toBe(false);
  });
});
