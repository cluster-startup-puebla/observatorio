import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("redirectIfSession", () => {
  it("aplica sessionRedirect y no decide el destino", () => {
    const source = readFileSync("src/lib/auth/redirect-if-session.ts", "utf8");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("readSessionAccount");
    expect(source).toContain("sessionRedirect");
    expect(source).toContain("onboarded: account.onboarded");
    expect(source).toContain("if (next) redirect(next)");
    expect(source).not.toContain("pathAfterSignIn");
    expect(source).not.toContain("empresario");
    expect(source).not.toContain("homeForRole");
  });

  it("la sesión ya trae onboarded y este plan no la reescribe", () => {
    const source = readFileSync("src/lib/auth/session-account.ts", "utf8");
    expect(source).toContain("onboarded: account.onboarded");
    expect(source).toContain("const onboarded = Boolean(profile.data?.onboarded_at)");
  });
});
