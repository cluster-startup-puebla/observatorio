import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const awardLavas = vi.fn();
vi.mock("./award", () => ({ awardLavas: (...args: unknown[]) => awardLavas(...args) }));

describe("maybeAwardEvaluation", () => {
  beforeEach(() => awardLavas.mockReset());

  it("omite si no está terminada o sin score", async () => {
    const { maybeAwardEvaluation } = await import("./maybe-award-evaluation");
    expect(
      await maybeAwardEvaluation({} as never, {
        companyId: "c1",
        instrumentId: "i1",
        phase: "answering",
        scored: true,
      }),
    ).toEqual({ skipped: "not_done" });
    expect(awardLavas).not.toHaveBeenCalled();
  });

  it("otorga con ref eval:instrumentId", async () => {
    const { maybeAwardEvaluation, evaluationAwardRef } = await import("./maybe-award-evaluation");
    awardLavas.mockResolvedValue({ ok: true, awarded: 25 });
    await maybeAwardEvaluation({} as never, {
      companyId: "c1",
      instrumentId: "i1",
      phase: "done",
      scored: true,
    });
    expect(evaluationAwardRef("i1")).toBe("eval:i1");
    expect(awardLavas).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        actionCode: "evaluacion_terminada",
        refKey: "eval:i1",
      }),
    );
  });

  it("el envío engancha el award tras upsert", () => {
    const src = readFileSync("src/app/api/metodologia/envio/route.ts", "utf8");
    expect(src).toContain("maybeAwardEvaluation");
  });
});
