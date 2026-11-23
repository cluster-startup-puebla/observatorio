import { describe, expect, it } from "vitest";
import { applyRsvpBoard, rsvpLinkOrgBars, rsvpPaceEvents } from "./rsvp-board-extras";
import { emptyTablero } from "./snapshot";

const orgs = [{ id: "o1", name: "Coparmex" }];

describe("rsvp board extras", () => {
  it("arma pace y enlaces desde RSVPs de la sesión", () => {
    const rows = [
      {
        id: "a",
        status: "confirmed",
        confirmed_at: "2026-11-22T18:00:00.000Z",
        organization_id: "o1",
      },
      {
        id: "b",
        status: "pending",
        confirmed_at: null,
        organization_id: "o1",
      },
      {
        id: "c",
        status: "confirmed",
        confirmed_at: "2026-11-22T19:00:00.000Z",
        organization_id: null,
      },
    ];
    expect(rsvpPaceEvents(rows)).toHaveLength(2);
    expect(rsvpLinkOrgBars(rows, orgs)).toEqual([
      { organismo: "Coparmex", enlaces: 2, registrados: 1, pendientes: 1 },
    ]);
    const board = applyRsvpBoard(emptyTablero(), rows, orgs, new Date("2026-11-22T20:00:00.000Z"));
    expect(board.linkSignups).toBe(2);
    expect(board.linkAccepted).toBe(1);
    expect(board.linkPending).toBe(1);
    expect(board.byLinkOrg[0]?.organismo).toBe("Coparmex");
    expect(board.pace.some((row) => row.confirmaciones > 0)).toBe(true);
  });
});
