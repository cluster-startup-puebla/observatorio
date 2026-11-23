import { describe, expect, it } from "vitest";
import { toRsvpSeat } from "./rsvp-seat";

describe("toRsvpSeat", () => {
  it("confirmed y pending cuentan; cancelled se ignora", () => {
    expect(toRsvpSeat({ status: "confirmed", sector_slug: "turismo", sectors: { name: "Turismo", slug: "turismo" } })).toEqual({
      sectorSlug: "turismo",
      sectorName: "Turismo",
      status: "confirmed",
      released: false,
    });
    expect(toRsvpSeat({ status: "pending", sector_slug: "turismo" })).toEqual({
      sectorSlug: "turismo",
      sectorName: "turismo",
      status: "pending",
      released: false,
    });
    expect(toRsvpSeat({ status: "cancelled", sector_slug: "turismo" })).toBeNull();
  });
});