import { render } from "@react-email/render";
import type { MailKind } from "@/lib/admin/bandeja/kinds";
import { EventPassMail } from "./event-pass-mail";
import { OpenInnovationMail } from "./open-innovation-mail";
import { passQrAttachment, type PassAttachment } from "./pass-qr";
import { ReminderMail } from "./reminder-mail";
import { ThanksMail } from "./thanks-mail";
import { WelcomeMail } from "./welcome-mail";

export type PaintedMail = { html: string; attachments: PassAttachment[] };

export async function paintMail(input: {
  kind: MailKind;
  profileId: string | null;
  sessionLabel: string | null;
  continueHref: string | null;
}): Promise<PaintedMail> {
  if (input.kind === "password") throw new Error("sin cuerpo");
  if (input.kind === "welcome") {
    return { html: await render(<WelcomeMail continueHref={input.continueHref} />), attachments: [] };
  }
  if (input.kind === "open_innovation") {
    return { html: await render(<OpenInnovationMail />), attachments: [] };
  }
  if (input.kind === "thanks") {
    return { html: await render(<ThanksMail sessionLabel={input.sessionLabel} />), attachments: [] };
  }
  const profileId = input.profileId?.trim() ?? "";
  if (!profileId) throw new Error("sin pase");
  const attachments = [await passQrAttachment(profileId)];
  const html =
    input.kind === "event_pass"
      ? await render(<EventPassMail sessionLabel={input.sessionLabel} />)
      : await render(<ReminderMail sessionLabel={input.sessionLabel} />);
  return { html, attachments };
}
