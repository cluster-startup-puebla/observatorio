import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { attendeesFor, currentFlip, topicDraft } from "./current";

describe("detalle de sesiones", () => {
  it("deja vigentes las demás y los asistentes van con la que sigue abierta", () => {
    expect(currentFlip([{ id: "a", isCurrent: true }, { id: "b", isCurrent: false }], "b", true)).toEqual({
      clearIds: [],
      setId: "b",
      isCurrent: true,
      stillCurrent: ["a"],
    });
    expect(currentFlip([{ id: "a", isCurrent: true }], "a", false)).toEqual({
      clearIds: [],
      setId: "a",
      isCurrent: false,
      stillCurrent: [],
    });
    expect(attendeesFor(true, [{ profile_id: "p1" }])).toEqual([{ profile_id: "p1" }]);
    expect(attendeesFor(false, [{ profile_id: "p1" }])).toEqual([]);
    expect(topicDraft({ title: "Datos", position: 1 })).toEqual({ ok: true, title: "Datos", position: 1 });
    expect(topicDraft({ title: " ", position: 1 }).ok).toBe(false);
    expect(topicDraft({ title: "Datos", position: 0 }).ok).toBe(false);
  });

  it("el handler guarda la vigencia sin apagar las demás", () => {
    const source = readFileSync("src/app/api/admin/sesiones/[id]/route.ts", "utf8");
    const detail = readFileSync("src/lib/admin/sesiones/detail.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("currentFlip");
    expect(source).toContain('.from("sessions")');
    expect(source).toContain("is_current");
    expect(source).not.toContain("is_current: false");
    expect(source).toContain("scheduleFromForm");
    expect(source).toContain("saveSessionQuotas");
    expect(detail).toContain("session_sector_quotas");
  });
});

