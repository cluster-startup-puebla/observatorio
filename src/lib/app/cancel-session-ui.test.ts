import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la sesión en app permite cancelar RSVP confirmado", () => {
  const page = readFileSync("src/app/app/sesiones/[slug]/page.tsx", "utf8");
  const action = readFileSync("src/lib/app/cancel-session-rsvp-action.ts", "utf8");
  const attendance = readFileSync("src/lib/app/session-attendance.ts", "utf8");
  expect(attendance).toContain("canCancel");
  expect(page).toContain("CancelSessionRsvp");
  expect(action).toContain("cancel_session_rsvp");
});