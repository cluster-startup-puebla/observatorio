import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("logoutHomeAction", () => {
  it("borra la sesión y la marca del organismo antes de ir al inicio", () => {
    const source = readFileSync("src/lib/auth/logout-home.ts", "utf8");
    const clear = source.indexOf("await clearSupabaseSession()");
    const account = source.indexOf("await clearAccountId()");
    const slug = source.indexOf('jar.delete("org-slug")');
    const exit = source.indexOf('redirect(logoutDestination("home"))');
    expect(source).toContain('"use server"');
    expect(clear).toBeGreaterThanOrEqual(0);
    expect(account).toBeGreaterThanOrEqual(0);
    expect(slug).toBeGreaterThan(clear);
    expect(slug).toBeGreaterThan(account);
    expect(exit).toBeGreaterThan(slug);
    expect(source).not.toContain("/admin/login");
    expect(source).not.toContain("/login?aviso=sesion");
  });
});
