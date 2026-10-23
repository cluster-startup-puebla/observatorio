import { describe, expect, it } from "vitest";
import { visibleEventLogos } from "./event-logos";

describe("logos del día", () => {
  it("deja fuera a quien no marcó el check o no tiene archivo", () => {
    const rows = visibleEventLogos(
      [
        { id: "c1", legalName: "Norte", profileId: "p1", show: true },
        { id: "c2", legalName: "Sur", profileId: "p2", show: false },
        { id: "c3", legalName: "Centro", profileId: "p3", show: true },
      ],
      [{ profileId: "p1" }],
    );
    expect(rows).toEqual([{ companyId: "c1", name: "Norte", profileId: "p1" }]);
  });
});
