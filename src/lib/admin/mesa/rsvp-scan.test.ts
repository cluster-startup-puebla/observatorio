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

  it("el handler prepara llegada por RPC y manda el código en claro", () => {
    const process = readFileSync("src/lib/admin/mesa/process-scan.ts", "utf8");
    const action = readFileSync("src/lib/admin/mesa/scan-action.ts", "utf8");
    const scanner = readFileSync("src/components/mesa/qr-scanner.tsx", "utf8");
    expect(process).toContain("mesa_prepare_arrival");
    expect(action).toContain("createSupabaseAdmin");
    expect(action).toContain("readCode");
    expect(scanner).toContain("scanMesaAction(value)");
  });

  it("onboarding cancela por sesión cuando hay session_id", () => {
    const cancel = readFileSync("src/lib/onboarding/cancel-attendance.ts", "utf8");
    const slot = readFileSync("src/components/onboarding/attendance-slot.tsx", "utf8");
    expect(cancel).toContain("cancel_session_rsvp");
    expect(slot).toContain('name="session_id"');
  });
});
