import { describe, expect, it } from "vitest";
import { needsDisclaimer } from "./disclaimer-gate";

describe("aviso de la metodología", () => {
  it("se muestra solo la primera vez y sin respuestas", () => {
    expect(needsDisclaimer({ acceptedAt: null, started: false })).toBe(true);
    expect(needsDisclaimer({ acceptedAt: "2026-11-18T10:00:00Z", started: false })).toBe(false);
    expect(needsDisclaimer({ acceptedAt: null, started: true })).toBe(false);
  });
});
