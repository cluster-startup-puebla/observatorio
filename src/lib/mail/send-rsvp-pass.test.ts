import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("sendRsvpPass", () => {
  it("usa EventPassMail con CTA de crear cuenta", () => {
    const send = readFileSync("src/lib/mail/send-rsvp-pass.tsx", "utf8");
    const mail = readFileSync("src/lib/mail/event-pass-mail.tsx", "utf8");
    expect(send).toContain("EventPassMail");
    expect(send).toContain("accountHref");
    expect(send).not.toContain("No necesitas crear cuenta");
    expect(send).toContain("Tu pase para la sesión ya está listo");
    expect(mail).toContain("MailAccountCta");
    expect(mail).toContain("MailShell");
  });
});
