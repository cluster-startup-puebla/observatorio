import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("envío masivo", () => {
  it("pinta cada fila, adjunta el pase y arma el permiso", () => {
    const deliver = readFileSync("src/lib/mail/deliver.ts", "utf8");
    const pending = readFileSync("src/lib/mail/paint-pending.ts", "utf8");
    const queue = readFileSync("src/lib/mail/broadcast-queue.ts", "utf8");
    const send = readFileSync("src/lib/mail/send-broadcast.ts", "utf8");
    expect(deliver).toContain("paintPending");
    expect(deliver).toContain("resendPayload");
    expect(deliver).toContain("idempotencyKey: row.id");
    expect(deliver).not.toContain("renderBroadcast");
    expect(pending).toContain("paintMail");
    expect(pending).toContain("ensureConsentToken");
    expect(pending).toContain('row.kind === "open_innovation"');
    expect(queue).toContain("profile_id");
    expect(send).toContain("sessionLabel");
  });
});
