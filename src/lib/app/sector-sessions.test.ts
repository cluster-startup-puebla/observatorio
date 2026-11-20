import { describe, expect, it } from "vitest";
import { nextForSector, splitSessions, type SectorSession } from "./sector-sessions";

const today = "2026-11-20";

function row(sessionOn: string, title = sessionOn): SectorSession {
  return { publicSlug: sessionOn, title, sessionOn, venue: "Sede" };
}

describe("sesiones del sector", () => {
  it("cuenta hoy como próxima y ordena ambos lados", () => {
    const groups = splitSessions(
      [
        row("2026-12-02", "Después"),
        row("2026-11-19", "Ayer"),
        row("2026-11-20", "Hoy"),
        row("2026-11-01", "Antes"),
      ],
      today,
    );
    expect(groups.upcoming.map((item) => item.sessionOn)).toEqual(["2026-11-20", "2026-12-02"]);
    expect(groups.past.map((item) => item.sessionOn)).toEqual(["2026-11-19", "2026-11-01"]);
  });

  it("elige la próxima con la fecha más cercana", () => {
    const rows = [row("2026-12-02"), row("2026-11-20"), row("2026-11-01")];
    expect(nextForSector(rows, today)?.sessionOn).toBe("2026-11-20");
  });

  it("devuelve null si no hay próximas", () => {
    expect(nextForSector([row("2026-11-01"), row("2026-11-19")], today)).toBeNull();
    expect(nextForSector([], today)).toBeNull();
  });
});
