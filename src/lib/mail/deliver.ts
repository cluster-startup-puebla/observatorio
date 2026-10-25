import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type { BroadcastKind } from "./broadcast-audience";
import { renderBroadcast } from "./render-broadcast";

export type PendingMail = {
  id: string;
  to_email: string;
  subject: string;
  kind: BroadcastKind;
};

const missing = "Falta RESEND_API_KEY o MAIL_FROM";

export async function deliverPending(db: SupabaseClient, rows: PendingMail[]) {
  if (!rows.length) return { sent: 0 };
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    for (const row of rows) await mark(db, row.id, missing);
    return { sent: 0, warning: "Los correos quedaron en la bandeja. Falta RESEND_API_KEY o MAIL_FROM." };
  }
  let sent = 0;
  for (const row of rows) {
    const html = await renderBroadcast(row.kind);
    const outcome = await post(key, from, row, html);
    if (!outcome.providerId) {
      await mark(db, row.id, outcome.error, html);
      continue;
    }
    const updated = await db.from("outbox_messages").update({
      sent_at: new Date().toISOString(),
      provider_id: outcome.providerId,
      last_error: null,
      body_html: html,
    }).eq("id", row.id);
    if (updated.error) continue;
    await db.from("outbox_attempts").insert({ message_id: row.id, provider_id: outcome.providerId });
    sent += 1;
  }
  return { sent };
}

async function post(key: string, from: string, row: PendingMail, html: string) {
  const sent = await new Resend(key).emails.send(
    { from, to: row.to_email, subject: row.subject, html },
    { idempotencyKey: row.id },
  );
  if (sent.error || !sent.data?.id) return { error: sent.error?.message ?? "Resend no devolvió id" };
  return { providerId: sent.data.id, error: "" };
}

async function mark(db: SupabaseClient, id: string, error: string, html?: string) {
  await db.from("outbox_messages").update({ last_error: error, body_html: html ?? null }).eq("id", id);
  await db.from("outbox_attempts").insert({ message_id: id, error });
}
