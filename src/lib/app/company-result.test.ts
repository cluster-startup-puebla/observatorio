import { describe, expect, it } from "vitest";
import { liveSession } from "@/lib/methodology/v2/live-session";
import { companyResult } from "./company-result";

describe("companyResult", () => {
  it("arma el cierre y la traza cuando la evaluación ya cerró", async () => {
    const { answers } = liveSession();
    const result = await companyResult({
      phase: "done",
      instrument_id: "automotriz",
      answers,
      finished_at: "2026-11-20T00:00:00Z",
      score: { ismsNivel2: 60 },
    });
    expect(result?.trace.instrumentId).toBe("automotriz");
    expect(result?.trace.finishedAt).toBe("2026-11-20T00:00:00Z");
    expect(result?.trace.ismsNivel2).toBe(60);
    expect(result?.trace.actions.length).toBeGreaterThan(0);
    expect(result?.roadmap.length).toBeGreaterThan(0);
  });

  it("no arma nada si la evaluación sigue abierta", async () => {
    const result = await companyResult({ phase: "sector", instrument_id: "automotriz", answers: {} });
    expect(result).toBeNull();
  });
});
