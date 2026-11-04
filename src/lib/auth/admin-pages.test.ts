import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("puertas de admin", () => {
  it("login usa adminLoginRedirect y no calcula el destino en la página", () => {
    const source = readFileSync("src/app/admin/login/page.tsx", "utf8");
    expect(source).toContain("adminLoginRedirect");
    expect(source).toContain("open ? null : await readSessionAccount()");
    expect(source).toContain("if (next) redirect(next)");
    expect(source).not.toContain("pathAfterSignIn");
    expect(source).not.toContain("homeForRole");
    expect(source).not.toContain("redirectIfSession");
    expect(source).not.toContain('redirect("/admin/signup")');
  });

  it("signup usa adminSignupRedirect y no manda siempre a login", () => {
    const source = readFileSync("src/app/admin/signup/page.tsx", "utf8");
    expect(source).toContain("adminSignupRedirect");
    expect(source).toContain("open ? null : await readSessionAccount()");
    expect(source).toContain("if (next) redirect(next)");
    expect(source).not.toContain("redirectIfSession");
    expect(source).not.toContain('redirect("/admin/login")');
  });
});
