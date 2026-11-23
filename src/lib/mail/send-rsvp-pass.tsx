import "server-only";

import { render } from "@react-email/render";
import { Resend } from "resend";
import { passQrAttachment } from "@/lib/mail/pass-qr";
import { accountHref } from "./continue-href";
import { EventPassMail } from "./event-pass-mail";
import { mailFrom } from "./mail-from";
import { resendPayload } from "./post-mail";

/** Confirmed RSVP mail with branded pass + optional account CTA. */
export async function sendRsvpPass(toEmail: string, rsvpId: string, sessionLabel: string) {
  const key = process.env.RESEND_API_KEY;
  const from = mailFrom(process.env.MAIL_FROM);
  if (!key || !from) return { ok: false as const, reason: "mail" as const };
  const qr = await passQrAttachment(rsvpId);
  const html = await render(
    <EventPassMail
      sessionLabel={sessionLabel}
      accountHref={accountHref(process.env.NEXT_PUBLIC_SITE_URL, toEmail)}
    />,
  );
  const sent = await new Resend(key).emails.send(
    resendPayload({
      from,
      to: toEmail,
      subject: "Tu pase para la sesión ya está listo",
      html,
      attachments: [qr],
    }),
    { idempotencyKey: `rsvp-pass-${rsvpId}` },
  );
  return sent.error ? { ok: false as const, reason: "send" as const } : { ok: true as const };
}
