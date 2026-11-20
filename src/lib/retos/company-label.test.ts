import { describe, expect, it } from "vitest";
import { companyLabel } from "./company-label";

describe("companyLabel", () => {
  it("shows name or anonymous tender", () => {
    expect(companyLabel({ showCompany: true, snapshot: "Acme SA" })).toBe("Acme SA");
    expect(companyLabel({ showCompany: false, snapshot: "Acme SA" })).toBe("Licitación anónima");
    expect(companyLabel({ showCompany: true, snapshot: null })).toBe("Licitación anónima");
  });
});
