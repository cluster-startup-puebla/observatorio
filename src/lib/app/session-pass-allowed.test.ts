import { describe, expect, it } from "vitest";
import { sessionPassAllowed } from "./session-pass-allowed";

describe("sessionPassAllowed", () => {
  it("empresa verificada puede ver pase", () => {
    expect(sessionPassAllowed({ admittedAt: "2026-11-23", crmStatuses: [] })).toBe(true);
  });

  it("CRM aceptado puede ver pase", () => {
    expect(sessionPassAllowed({ admittedAt: null, crmStatuses: ["registrado"] })).toBe(true);
    expect(sessionPassAllowed({ admittedAt: null, crmStatuses: ["cargado"] })).toBe(false);
    expect(sessionPassAllowed({ admittedAt: null, crmStatuses: [] })).toBe(false);
  });
});
