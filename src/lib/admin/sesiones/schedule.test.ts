import { describe, expect, it } from "vitest";
import { currentOption, sessionOnLabel, sessionWhen } from "@/lib/sessions/face";
import { scheduleDraft } from "./schedule";

describe("fecha de la sesión", () => {
  it("guarda el 12 de noviembre de 2026 con hora y zona", () => {
    const draft = scheduleDraft({
      sessionOn: "2026-11-12",
      starts: "08:00",
      ends: "12:00",
      timeZone: "America/Mexico_City",
    });
    expect(draft).toEqual({
      ok: true,
      fields: {
        session_on: "2026-11-12",
        starts_local: "08:00",
        ends_local: "12:00",
        time_zone: "America/Mexico_City",
      },
    });
    expect(sessionOnLabel("2026-11-12")).toBe("12 de noviembre de 2026");
    expect(
      sessionWhen({
        sessionOn: "2026-11-12",
        starts: "08:00:00",
        ends: "12:00:00",
        timeZone: "America/Mexico_City",
      }),
    ).toBe("12 de noviembre de 2026 · 08:00–12:00 · America/Mexico_City");
  });

  it("rechaza una zona escrita a mano", () => {
    expect(scheduleDraft({ sessionOn: "2026-11-12", starts: "08:00", ends: "12:00", timeZone: "CST" }).ok).toBe(
      false,
    );
  });

  it("etiqueta dos vigentes para el select", () => {
    const first = currentOption({
      id: "a",
      venue: "Quinta Real, Puebla",
      session_on: "2026-11-12",
      starts_local: "08:00:00",
      ends_local: "12:00:00",
    });
    const second = currentOption({
      id: "b",
      venue: "Otra sede",
      session_on: "2026-11-12",
      starts_local: "16:00:00",
      ends_local: "19:00:00",
    });
    expect(first.label).toBe("Quinta Real, Puebla · 12 de noviembre de 2026 · 08:00–12:00");
    expect(second.label).toBe("Otra sede · 12 de noviembre de 2026 · 16:00–19:00");
    expect(first.id).not.toBe(second.id);
  });
});
