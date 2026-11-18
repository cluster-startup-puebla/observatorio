import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el tablero cuenta sin bajarse el JSON y se refresca cada minuto", () => {
  const tally = readFileSync("src/lib/admin/diagnosticos/tally.ts", "utf8");
  const refresh = readFileSync("src/app/admin/diagnosticos/refresh.tsx", "utf8");
  const nav = readFileSync("src/components/admin/nav.ts", "utf8");
  expect(tally).toContain('head: true');
  expect(tally).not.toContain("answers");
  expect(tally).not.toContain("score");
  expect(refresh).toContain("60_000");
  expect(refresh).toContain("Recargar");
  expect(refresh).not.toContain("channel");
  expect(refresh).not.toContain("realtime");
  expect(nav).toContain('href: "/admin/diagnosticos"');
});
