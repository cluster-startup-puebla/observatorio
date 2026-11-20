import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const awardLavas = vi.fn();
vi.mock("./award", () => ({ awardLavas: (...args: unknown[]) => awardLavas(...args) }));

describe("maybeAwardConsent", () => {
  it("otorga con ref del perfil", async () => {
    const { maybeAwardConsent } = await import("./maybe-award-consent");
    awardLavas.mockResolvedValue({ ok: true, awarded: 10 });
    await maybeAwardConsent({} as never, { companyId: "c1", profileId: "p1" });
    expect(awardLavas).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        actionCode: "innovacion_aceptada",
        refKey: "p1",
      }),
    );
  });

  it("join y accept enganchan el award", () => {
    const join = readFileSync("src/lib/app/join-open-innovation.ts", "utf8");
    const accept = readFileSync("src/app/api/innovacion-abierta/aceptar/route.ts", "utf8");
    const sql = readFileSync("supabase/migrations/20261120030350_award_lavas_for_consent.sql", "utf8");
    expect(join).toContain("maybeAwardConsent");
    expect(accept).toContain("award_lavas_for_consent");
    expect(sql).toContain("function public.award_lavas_for_consent(raw_token text)");
    expect(sql).toContain(
      "grant execute on function public.award_lavas_for_consent(text) to anon, authenticated",
    );
  });
});
