import "server-only";

import { Resend } from "resend";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { continueHref } from "./continue-href";
import { mailFrom } from "./mail-from";
import { paintMail } from "./paint-mail";
import { resendPayload } from "./post-mail";

const missing = "Falta RESEND_API_KEY o MAIL_FROM";

type OwnKind = "welcome" | "event_pass";

type OwnRow = {
  id: string;
  to_email: string;
  subject: string;
  profile_id: string | null;
  already_sent: boolean;
};

type Access = ReturnType<typeof createSupabaseWithAccess>;

function ownRow(data: OwnRow | OwnRow[] | null) {
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

function record(db: Access, id: string, provider: string | null, failure: string | null, html: string | null) {
  return db.rpc("record_own_mail", { message_id: id, provider, failure, html });
}

export async function sendOwnMail(accessToken: string, kind: OwnKind) {
  try {
    const db = createSupabaseWithAccess(accessToken);
    const enqueued = await db.rpc("enqueue_own_mail", { mail_kind: kind });
    const row = ownRow((enqueued.data ?? null) as OwnRow | OwnRow[] | null);
    if (enqueued.error || !row || row.already_sent) return;
    const key = process.env.RESEND_API_KEY;
    const from = mailFrom(process.env.MAIL_FROM);
    if (!key || !from) {
      await record(db, row.id, null, missing, null);
      return;
    }
    const painted = await paintMail({
      kind,
      profileId: row.profile_id,
      sessionLabel: null,
      continueHref: kind === "welcome" ? continueHref(process.env.NEXT_PUBLIC_SITE_URL) : null,
      acceptHref: null,
    });
    const sent = await new Resend(key).emails.send(
      resendPayload({ from, to: row.to_email, subject: row.subject, html: painted.html, attachments: painted.attachments }),
      { idempotencyKey: row.id },
    );
    await record(db, row.id, sent.data?.id ?? null, sent.error?.message ?? null, painted.html);
  } catch (error) {
    console.error("sendOwnMail", error);
  }
}
