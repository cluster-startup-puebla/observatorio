import { mailFor } from "@/lib/outbox-message";

export function innovationDetail(row: { kind: string; subject: string; to_email: string } | null) {
  if (!row || row.kind !== "open_innovation") return null;
  const expected = mailFor("open_innovation", row.to_email);
  if (row.subject !== expected.subject) return null;
  return { to: expected.to, subject: expected.subject };
}
