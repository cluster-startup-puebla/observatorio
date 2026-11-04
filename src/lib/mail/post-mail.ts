import { mailBrand } from "./brand";
import type { PassAttachment } from "./pass-qr";

export function resendPayload(input: {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments: PassAttachment[];
}) {
  return {
    from: input.from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    replyTo: mailBrand.replyTo,
    attachments: input.attachments.length ? input.attachments : undefined,
  };
}
