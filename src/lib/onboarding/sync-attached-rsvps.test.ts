import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("sync RSVPs al tener cuenta", () => {
  it("onboarding y pour llaman attach, CRM enlace y pases pendientes", () => {
    const sync = readFileSync("src/lib/onboarding/sync-attached-rsvps.ts", "utf8");
    const done = readFileSync("src/lib/onboarding/complete-empresario.ts", "utf8");
    const pour = readFileSync("src/lib/registro/pour.ts", "utf8");
    const emit = readFileSync("src/lib/onboarding/emit-missing-rsvp-passes.ts", "utf8");
    const deliver = readFileSync("src/lib/mail/deliver-rsvp-pass.ts", "utf8");
    expect(sync).toContain('rpc("attach_rsvps_for_email")');
    expect(sync).toContain('rpc("ensure_enlace_contacts_from_rsvps")');
    expect(sync).toContain("emitMissingRsvpPasses");
    expect(done).toContain("syncAttachedRsvps");
    expect(pour).toContain("syncAttachedRsvps");
    expect(emit).toContain('from("rsvp_passes")');
    expect(emit).toContain("deliverRsvpPass");
    expect(deliver).toContain('rpc("record_rsvp_pass"');
    expect(readFileSync("src/lib/mail/send-rsvp-pass.ts", "utf8")).toContain("idempotencyKey");
  });
});