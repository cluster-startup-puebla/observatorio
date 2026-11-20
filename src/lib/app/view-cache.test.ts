import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { sessionLife, steadyLife } from "./view-cache";

it("perfil y empresa duran horas; las sesiones, una hora", () => {
  expect(steadyLife.stale).toBe(60 * 60 * 12);
  expect(sessionLife.stale).toBe(60 * 60);
  expect(sessionLife.stale).toBeLessThan(steadyLife.stale);

  const profile = readFileSync("src/app/app/profile/page.tsx", "utf8");
  const company = readFileSync("src/app/app/company/page.tsx", "utf8");
  const home = readFileSync("src/app/app/home/page.tsx", "utf8");
  const sessions = readFileSync("src/app/app/sesiones/page.tsx", "utf8");
  const detail = readFileSync("src/app/app/sesiones/[slug]/page.tsx", "utf8");
  const identity = readFileSync("src/lib/app/load-identity.ts", "utf8");
  const loader = readFileSync("src/lib/app/load-sector-sessions.ts", "utf8");

  for (const source of [profile, company]) {
    expect(source).toContain('"use cache: private"');
    expect(source).toContain("steadyLife");
  }
  for (const source of [home, sessions, detail]) {
    expect(source).toContain('"use cache: private"');
    expect(source).toContain("sessionLife");
    expect(source).not.toContain("connection(");
  }
  expect(identity).toContain("steadyLife");
  expect(identity).not.toContain('cacheLife("hours")');
  expect(loader).not.toContain("connection(");
});
