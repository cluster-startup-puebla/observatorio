import "server-only";

import { Resend } from "resend";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { writePass } from "@/lib/onboarding/write-pass";
import { mailFrom } from "./mail-from";
import { paintMail } from "./paint-mail";
import { resendPayload } from "./post-mail";

type PassRow = {
  id: string;
  to_email: string;
  subject: string;
  profile_id: string | null;
  already_sent: boolean;
};

function one(data: PassRow | PassRow[] | null) {
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

export async function sendPublicPass(accessToken: string, profileId: string) {
  const db = createSupabaseWithAccess(accessToken);
  const enqueued = await db.rpc("enqueue_public_pass", { guest_id: profileId });
  const row = one((enqueued.data ?? null) as PassRow | PassRow[] | null);
  if (enqueued.error || !row?.profile_id) return { ok: false as const };
  const written = await writePass(db, row.profile_id);
  if (!written.ok) return { ok: false as const };
  if (row.already_sent) return { ok: true as const };
  const key = process.env.RESEND_API_KEY;
  const from = mailFrom(process.env.MAIL_FROM);
  if (!key || !from) {
    await db.rpc("record_accepted_pass", {
      message_id: row.id,
      provider: null,
      failure: "Falta RESEND_API_KEY o MAIL_FROM",
      html: null,
    });
    return { ok: false as const };
  }
  const painted = await paintMail({
    kind: "event_pass",
    profileId: row.profile_id,
    sessionLabel: null,
    continueHref: null,
    acceptHref: null,
  });
  const sent = await new Resend(key).emails.send(
    resendPayload({
      from,
      to: row.to_email,
      subject: row.subject,
      html: painted.html,
      attachments: painted.attachments,
    }),
    { idempotencyKey: row.id },
  );
  await db.rpc("record_accepted_pass", {
    message_id: row.id,
    provider: sent.data?.id ?? null,
    failure: sent.error?.message ?? null,
    html: painted.html,
  });
  return sent.error ? { ok: false as const } : { ok: true as const };
}
