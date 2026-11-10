import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("logoutHomeAction", () => {
  it("borra la sesión y la marca del organismo antes de ir al inicio", () => {
    const source = readFileSync("src/lib/auth/logout-home.ts", "utf8");
    const clear = source.indexOf("clearSupabaseSession");
    const slug = source.indexOf('jar.delete("org-slug")');
    const exit = source.indexOf('redirect(logoutDestination("home"))');
    expect(source).toContain('"use server"');
    expect(source).toContain("clearAccountId");
    expect(clear).toBeGreaterThan(-1);
    expect(slug).toBeGreaterThan(clear);
    expect(exit).toBeGreaterThan(slug);
    expect(source).not.toContain("/admin/login");
    expect(source).not.toContain("/login?aviso=sesion");
  });
});
