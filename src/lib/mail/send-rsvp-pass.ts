import "server-only";

import { Resend } from "resend";
import { passQrAttachment } from "@/lib/mail/pass-qr";
import { mailFrom } from "./mail-from";
import { resendPayload } from "./post-mail";

/** Confirmed RSVP mail with QR (rsvp id). No account required. */
export async function sendRsvpPass(toEmail: string, rsvpId: string, sessionLabel: string) {
  const key = process.env.RESEND_API_KEY;
  const from = mailFrom(process.env.MAIL_FROM);
  if (!key || !from) return { ok: false as const, reason: "mail" as const };
  const qr = await passQrAttachment(rsvpId);
  const html = [
    `<p>Tu lugar en <strong>${sessionLabel}</strong> ya está confirmado.</p>`,
    `<p>Muestra este pase en la entrada. No necesitas crear cuenta.</p>`,
    `<img src="cid:pase" alt="Pase" width="280" height="280" />`,
  ].join("");
  const sent = await new Resend(key).emails.send(
    resendPayload({
      from,
      to: toEmail,
      subject: `Tu pase · ${sessionLabel}`,
      html,
      attachments: [qr],
    }),
    { idempotencyKey: `rsvp-pass-${rsvpId}` },
  );
  return sent.error ? { ok: false as const, reason: "send" as const } : { ok: true as const };
}
