import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("lista RSVPs confirmados con pase por sesión", () => {
  const source = readFileSync("src/lib/admin/cuentas/load-session-passes.ts", "utf8");
  const tab = readFileSync("src/app/admin/cuentas/[id]/pase-tab.tsx", "utf8");
  expect(source).toContain("session_rsvps");
  expect(source).toContain('eq("status", "confirmed")');
  expect(tab).toContain("Pases por sesión");
  expect(tab).toContain("passQrDataUrl");
});
