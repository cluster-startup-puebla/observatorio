import { describe, expect, it } from "vitest";
import { holdsSession } from "./session-hold";

describe("holdsSession", () => {
  it("deja en onboarding a quien canceló, espera o viene de fuera", () => {
    expect(holdsSession({ cancelled: true, linkPending: false, externalPending: false })).toBe(true);
    expect(holdsSession({ cancelled: false, linkPending: true, externalPending: false })).toBe(true);
    expect(holdsSession({ cancelled: false, linkPending: false, externalPending: true })).toBe(true);
  });

  it("suelta a metodología solo con el lugar aceptado y vigente", () => {
    expect(holdsSession({ cancelled: false, linkPending: false, externalPending: false })).toBe(false);
  });
});
