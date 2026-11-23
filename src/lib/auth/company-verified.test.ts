import { describe, expect, it } from "vitest";
import { isCompanyVerified } from "./company-verified";

describe("isCompanyVerified", () => {
  it("solo cuenta con admitted_at", () => {
    expect(isCompanyVerified(null)).toBe(false);
    expect(isCompanyVerified(undefined)).toBe(false);
    expect(isCompanyVerified("")).toBe(false);
    expect(isCompanyVerified("2026-11-22T00:00:00Z")).toBe(true);
  });
});