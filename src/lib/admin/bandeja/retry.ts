import { outboxRow, type MailKind } from "./kinds";

export function retryRow(input: {
  kind: MailKind;
  to_email: string;
  profile_id: string | null;
  contact_id: string | null;
}) {
  const mail = outboxRow(input.kind, input.to_email);
  return {
    kind: mail.kind,
    to_email: mail.to_email,
    subject: mail.subject,
    profile_id: input.profile_id,
    contact_id: input.contact_id,
  };
}
