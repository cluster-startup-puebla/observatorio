import { describe, expect, it } from "vitest";
import { quotaDraft } from "./quotas";

describe("quotaDraft", () => {
  it("suma cupos y trata vacío como cero", () => {
    const form = new FormData();
    form.set("quota.a", "10");
    form.set("quota.b", "");
    form.set("quota.c", "5");
    expect(quotaDraft(form, ["a", "b", "c"], 8)).toEqual({
      ok: true,
      rows: [
        { sectorId: "a", capacity: 10 },
        { sectorId: "c", capacity: 5 },
      ],
      total: 15,
    });
  });

  it("rechaza sector desconocido y total menor al mínimo", () => {
    const bad = new FormData();
    bad.set("quota.x", "2");
    expect(quotaDraft(bad, ["a"], 1).ok).toBe(false);
    const low = new FormData();
    low.set("quota.a", "3");
    expect(quotaDraft(low, ["a"], 8)).toEqual({
      ok: false,
      reason: "el total de invitados es menor al cupo mínimo",
    });
  });
});
