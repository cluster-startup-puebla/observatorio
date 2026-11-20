import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("crear-cuenta, recuperar y restablecer", () => {
  it("leen la cookie con instant apagado y llaman al helper", () => {
    const pages: [string, string][] = [
      ["src/app/crear-cuenta/page.tsx", 'redirectIfSession("/crear-cuenta")'],
      ["src/app/recuperar/page.tsx", 'redirectIfSession("/recuperar")'],
    ];
    for (const [file, call] of pages) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("export const instant = false");
      expect(source).toContain(call);
      expect(source).not.toContain("homeForRole");
    }
  });

  it("crear-cuenta redirige antes del fallback de Suspense", () => {
    const source = readFileSync("src/app/crear-cuenta/page.tsx", "utf8");
    const call = source.indexOf('redirectIfSession("/crear-cuenta")');
    const suspense = source.indexOf("<Suspense");
    expect(call).toBeGreaterThan(-1);
    expect(call).toBeLessThan(suspense);
  });

  it("restablecer no expulsa la sesión ni mira el hash", () => {
    const source = readFileSync("src/app/restablecer/page.tsx", "utf8");
    expect(source).toContain("export const instant = false");
    expect(source).toContain("readSessionAccount");
    expect(source).not.toContain("redirectIfSession");
    expect(source).not.toContain("hash");
    expect(source).not.toContain("window");
    expect(source).not.toContain("location");
  });
});
