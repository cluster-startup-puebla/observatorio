import { mailFor } from "@/lib/outbox-message";

const kinds = ["password", "event_pass", "open_innovation"] as const;
export type MailKind = (typeof kinds)[number];

export function mailKind(value: string | undefined): MailKind | null {
  if (value && kinds.includes(value as MailKind)) return value as MailKind;
  return null;
}

export function outboxRow(kind: MailKind, email: string) {
  const mail = mailFor(kind, email);
  return { kind: mail.kind, to_email: mail.to, subject: mail.subject };
}
