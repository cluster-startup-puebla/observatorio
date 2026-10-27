import { describe, expect, it } from "vitest";
import { acceptSeat, cancelSeat, paceFor, type SeatPerson } from "./seat-rules";

const quota = { sector: "automotriz", capacity: 20 };

function person(partial: Partial<SeatPerson> & Pick<SeatPerson, "id" | "orgId">): SeatPerson {
  return {
    sector: "automotriz",
    onboarded: true,
    accepted: false,
    cancelled: false,
    ...partial,
  };
}

const accepted = (id: string, orgId: string) => person({ id, orgId, accepted: true });

describe("regla del cupo", () => {
  it("20 lugares, 19 aceptados y 3 en espera: el 20 entra y el 21 no", () => {
    const waiting = [
      person({ id: "c1", orgId: "clauz" }),
      person({ id: "c2", orgId: "clauz" }),
      person({ id: "n1", orgId: "canacintra" }),
    ];
    const taken = Array.from({ length: 19 }, (_, index) => accepted(`a${index}`, index < 10 ? "canacintra" : "clauz"));
    const first = acceptSeat([...taken, ...waiting], quota, "c1");
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(paceFor(first.people, quota, "clauz")).toMatchObject({ filled: 20, free: 0, full: true });
    const second = acceptSeat(first.people, quota, "n1");
    expect(second).toEqual({ ok: false, reason: "sector_lleno" });
    expect(first.people.find((item) => item.id === "n1")?.accepted).toBe(false);
  });

  it("quien solo terminó el onboarding no resta, y cancelar abre el lugar a mano", () => {
    const people = [accepted("a1", "canacintra"), person({ id: "espera", orgId: "clauz" })];
    expect(paceFor(people, { sector: "automotriz", capacity: 1 }, "canacintra")).toMatchObject({
      mine: 1,
      others: 0,
      filled: 1,
      full: true,
    });
    expect(acceptSeat(people, { sector: "automotriz", capacity: 1 }, "espera")).toEqual({
      ok: false,
      reason: "sector_lleno",
    });
    const freed = cancelSeat(people, "a1", "  no puedo asistir  ");
    expect(freed.ok).toBe(true);
    if (!freed.ok) return;
    const next = acceptSeat(freed.people, { sector: "automotriz", capacity: 1 }, "espera");
    expect(next.ok).toBe(true);
  });

  it("cancelar sin lugar o sin motivo no suelta nada", () => {
    const waiting = [person({ id: "espera", orgId: "clauz" })];
    expect(cancelSeat(waiting, "espera", "ya no voy")).toEqual({ ok: false, reason: "todavia_no_ocupa" });
    expect(cancelSeat([accepted("a1", "clauz")], "a1", "   ")).toEqual({ ok: false, reason: "motivo" });
    expect(cancelSeat([accepted("a1", "clauz")], "a1", "x".repeat(281))).toEqual({ ok: false, reason: "motivo" });
  });

  it("sin cupo la aceptación no se bloquea y la barra no se inventa", () => {
    const people = [person({ id: "n1", orgId: "canacintra" })];
    const open = acceptSeat(people, { sector: "automotriz", capacity: null }, "n1");
    expect(open.ok).toBe(true);
    expect(paceFor(people, { sector: "automotriz", capacity: null }, "canacintra")).toEqual({ open: false });
  });

  it("el alta sin organismo cuenta en los demás", () => {
    const people = [person({ id: "ext", orgId: null, accepted: true })];
    expect(paceFor(people, quota, "canacintra")).toMatchObject({ mine: 0, others: 1, filled: 1, free: 19 });
  });
});
