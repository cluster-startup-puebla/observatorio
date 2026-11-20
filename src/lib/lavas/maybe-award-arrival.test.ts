import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const awardLavas = vi.fn();
vi.mock("./award", () => ({ awardLavas: (...args: unknown[]) => awardLavas(...args) }));

describe("maybeAwardArrival", () => {
  it("usa profileId como ref_key", async () => {
    const { maybeAwardArrival } = await import("./maybe-award-arrival");
    awardLavas.mockResolvedValue({ ok: true, awarded: 15 });
    await maybeAwardArrival({} as never, { companyId: "c1", profileId: "p1" });
    expect(awardLavas).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        actionCode: "asistencia_llego",
        refKey: "p1",
        origen: "live",
      }),
    );
  });

  it("mesa llama el award tras insertar arrival", () => {
    const src = readFileSync("src/app/api/admin/mesa/route.ts", "utf8");
    expect(src).toContain("maybeAwardArrival");
    expect(src).toMatch(/\.insert\(plan\.arrival\)[\s\S]*maybeAwardArrival/);
  });
});

