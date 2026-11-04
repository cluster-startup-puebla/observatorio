import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("register, recuperar y restablecer", () => {
  it("leen la cookie con instant apagado y llaman al helper", () => {
    const pages: [string, string][] = [
      ["src/app/register/page.tsx", 'redirectIfSession("/register")'],
      ["src/app/recuperar/page.tsx", 'redirectIfSession("/recuperar")'],
      ["src/app/restablecer/page.tsx", 'redirectIfSession("/restablecer")'],
    ];
    for (const [file, call] of pages) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("export const instant = false");
      expect(source).toContain(call);
      expect(source).not.toContain("homeForRole");
    }
  });

  it("register redirige antes del fallback de Suspense", () => {
    const source = readFileSync("src/app/register/page.tsx", "utf8");
    const call = source.indexOf('redirectIfSession("/register")');
    const suspense = source.indexOf("<Suspense");
    expect(call).toBeGreaterThan(-1);
    expect(call).toBeLessThan(suspense);
  });

  it("restablecer no mira el hash del enlace", () => {
    const source = readFileSync("src/app/restablecer/page.tsx", "utf8");
    expect(source).not.toContain("hash");
    expect(source).not.toContain("window");
    expect(source).not.toContain("location");
  });
});
