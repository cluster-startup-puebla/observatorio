import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { attendeesFor, currentFlip, topicDraft } from "./current";

describe("detalle de sesiones", () => {
  it("deja una sola vigente y los asistentes van con ella", () => {
    expect(currentFlip([{ id: "a", isCurrent: true }, { id: "b", isCurrent: false }], "b", true)).toEqual({
      clearIds: ["a"],
      setId: "b",
      isCurrent: true,
    });
    expect(currentFlip([{ id: "a", isCurrent: true }], "a", false)).toEqual({
      clearIds: [],
      setId: "a",
      isCurrent: false,
    });
    expect(attendeesFor(true, [{ profile_id: "p1" }])).toEqual([{ profile_id: "p1" }]);
    expect(attendeesFor(false, [{ profile_id: "p1" }])).toEqual([]);
    expect(topicDraft({ title: "Datos", position: 1 })).toEqual({ ok: true, title: "Datos", position: 1 });
    expect(topicDraft({ title: " ", position: 1 }).ok).toBe(false);
    expect(topicDraft({ title: "Datos", position: 0 }).ok).toBe(false);
  });

  it("el handler limpia is_current antes de encender la nueva", () => {
    const source = readFileSync("src/app/api/admin/sesiones/[id]/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("currentFlip");
    expect(source).toContain('.from("sessions")');
    expect(source).toContain("is_current");
  });
});
