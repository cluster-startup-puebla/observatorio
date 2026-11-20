import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const awardLavas = vi.fn();
vi.mock("./award", () => ({ awardLavas: (...args: unknown[]) => awardLavas(...args) }));

describe("maybeAwardProfileComplete", () => {
  beforeEach(() => {
    awardLavas.mockReset();
  });

  it("incompleto no llama al award", async () => {
    const { maybeAwardProfileComplete } = await import("./maybe-award-profile");
    const result = await maybeAwardProfileComplete({} as never, {
      companyId: "c1",
      hasLogo: true,
      website: "  ",
    });
    expect(result).toEqual({ skipped: "incomplete" });
    expect(awardLavas).not.toHaveBeenCalled();
  });

  it("completo usa refKey perfil", async () => {
    const { maybeAwardProfileComplete } = await import("./maybe-award-profile");
    awardLavas.mockResolvedValue({ ok: true, awarded: 10 });
    await maybeAwardProfileComplete({} as never, {
      companyId: "c1",
      hasLogo: true,
      website: "https://ejemplo.com",
    });
    expect(awardLavas).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        companyId: "c1",
        actionCode: "perfil_completo",
        refKey: "perfil",
        origen: "live",
      }),
    );
  });

  it("el save de huecos dispara el award antes del redirect", () => {
    const src = readFileSync("src/lib/home/save-profile-gaps.ts", "utf8");
    expect(src).toContain("await awardProfileGapsIfComplete");
    expect(src).toMatch(/awardProfileGapsIfComplete[\s\S]*?done\(current\.profileId\)/);
  });
});
