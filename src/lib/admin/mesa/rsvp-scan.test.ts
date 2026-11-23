import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { looksLikeUuid, rsvpOnlyCheckIn } from "@/lib/admin/pases/scan";

describe("mesa con QR de RSVP", () => {
  it("reconoce uuid y acepta check-in sin cuenta", () => {
    const id = "a1111111-1111-4111-8111-111111111111";
    expect(looksLikeUuid(id)).toBe(true);
    expect(looksLikeUuid("not-a-uuid")).toBe(false);
    expect(rsvpOnlyCheckIn({ rsvpConfirmed: true })).toEqual({ ok: true, recordArrival: false });
    expect(rsvpOnlyCheckIn({ rsvpConfirmed: false })).toEqual({ ok: false, reason: "sin qr" });
  });

  it("el handler resuelve RSVP antes del perfil", () => {
    const route = readFileSync("src/app/api/admin/mesa/route.ts", "utf8");
    const resolve = readFileSync("src/lib/admin/mesa/resolve-code.ts", "utf8");
    expect(route).toContain("resolveMesaCode");
    expect(route).toContain("mesa_rsvp_guest");
    expect(route).toContain("rsvpOnlyCheckIn");
    expect(resolve).toContain("mesa_rsvp_guest");
  });

  it("onboarding cancela por sesión cuando hay session_id", () => {
    const cancel = readFileSync("src/lib/onboarding/cancel-attendance.ts", "utf8");
    const slot = readFileSync("src/components/onboarding/attendance-slot.tsx", "utf8");
    expect(cancel).toContain("cancel_session_rsvp");
    expect(slot).toContain('name="session_id"');
  });
});