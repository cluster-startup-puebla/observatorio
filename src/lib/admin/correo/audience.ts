import { outboxRow } from "@/lib/admin/bandeja/kinds";

export function innovationRecipients(profiles: { email: string | null; onboarded_at: string | null }[]) {
  return profiles
    .filter((profile) => profile.onboarded_at && profile.email)
    .map((profile) => outboxRow("open_innovation", profile.email ?? ""));
}
