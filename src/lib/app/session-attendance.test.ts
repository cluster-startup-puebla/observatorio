import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el detalle usa RSVP por sesión y permite apartar", () => {
  const page = readFileSync("src/app/app/sesiones/[slug]/page.tsx", "utf8");
  const helper = readFileSync("src/lib/app/session-attendance.ts", "utf8");
  expect(page).toContain("sessionAttendanceLabel");
  expect(page).toContain("ClaimSessionButton");
  expect(page).toContain("SessionPassQr");
  expect(page).toContain("SessionPassWaiting");
  expect(page).toContain("loadPassAuthorization");
  expect(helper).toContain("session_rsvps");
  expect(helper).toContain("canClaim");
  expect(helper).toContain("rsvpId");
  expect(helper).toContain('confirmed: "En espera"');
  expect(page).toContain('"Ya tienes lugar"');
});

