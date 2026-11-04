import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("home, login y verificar", () => {
  it("leen la cookie con instant apagado y llaman al helper", () => {
    const pages: [string, string][] = [
      ["src/app/page.tsx", 'redirectIfSession("/")'],
      ["src/app/login/page.tsx", 'redirectIfSession("/login")'],
      ["src/app/verificar/page.tsx", 'redirectIfSession("/verificar")'],
    ];
    for (const [file, call] of pages) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("export const instant = false");
      expect(source).toContain(call);
      expect(source).not.toContain("homeForRole");
    }
  });

  it("login resuelve la sesión antes de saltar a verificar", () => {
    const source = readFileSync("src/app/login/page.tsx", "utf8");
    const session = source.indexOf('redirectIfSession("/login")');
    const jump = source.indexOf("redirect(`/verificar?correo=");
    expect(session).toBeGreaterThan(-1);
    expect(jump).toBeGreaterThan(session);
    expect(source).not.toContain("pathAfterSignIn");
  });

  it("verificar resuelve la sesión antes del aviso de correo confirmado", () => {
    const source = readFileSync("src/app/verificar/page.tsx", "utf8");
    const session = source.indexOf('redirectIfSession("/verificar")');
    const jump = source.indexOf('redirect("/login?aviso=confirmado")');
    expect(session).toBeGreaterThan(-1);
    expect(jump).toBeGreaterThan(session);
  });
});
