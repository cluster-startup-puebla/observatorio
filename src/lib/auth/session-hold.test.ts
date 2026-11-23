import { describe, expect, it } from "vitest";
import { holdsSession } from "./session-hold";

describe("holdsSession", () => {
  it("bloquea solo cancelación o enlace pendiente", () => {
    expect(holdsSession({ cancelled: true, linkPending: false })).toBe(true);
    expect(holdsSession({ cancelled: false, linkPending: true })).toBe(true);
    expect(holdsSession({ cancelled: false, linkPending: false })).toBe(false);
  });
});
