import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mailFor } from "@/lib/outbox-message";
import type { BroadcastKind, RegisteredPerson } from "./broadcast-audience";
import { broadcastAudience } from "./broadcast-audience";
import type { PendingMail } from "./deliver";

type PersonRow = { id: string; email: string | null; onboarded_at: string | null };

export async function queueBroadcast(
  db: SupabaseClient,
  input: { kind: BroadcastKind; sessionId: string | null },
  actorId: string,
): Promise<{ error: string } | { rows: PendingMail[] }> {
  const loaded = await loadPeople(db);
  if ("error" in loaded) return { error: loaded.error ?? "No se pudo leer la audiencia." };
  const fresh = await withoutExisting(db, input, broadcastAudience(input.kind, loaded.rows));
  if ("error" in fresh) return { error: fresh.error ?? "No se pudo leer la audiencia." };
  const queued = await enqueue(db, input, actorId, fresh.rows);
  if (queued) return { error: queued };
  return pendingMails(db, input);
}

async function loadPeople(db: SupabaseClient) {
  const profiles = await db.from("profiles").select("id, email, onboarded_at");
  const arrivals = await db.from("arrivals").select("profile_id");
  if (profiles.error) return { error: profiles.error.message };
  if (arrivals.error) return { error: arrivals.error.message };
  const arrived = new Set((arrivals.data ?? []).map((row) => row.profile_id as string));
  const rows: RegisteredPerson[] = ((profiles.data ?? []) as PersonRow[]).map((row) => ({
    id: row.id,
    email: row.email ?? "",
    onboarded: Boolean(row.onboarded_at),
    arrived: arrived.has(row.id),
  }));
  return { rows };
}

async function withoutExisting(
  db: SupabaseClient,
  input: { kind: BroadcastKind; sessionId: string | null },
  people: RegisteredPerson[],
) {
  let query = db.from("outbox_messages").select("profile_id").eq("kind", input.kind);
  query = input.sessionId ? query.eq("session_id", input.sessionId) : query.is("session_id", null);
  const existing = await query;
  if (existing.error) return { error: existing.error.message };
  const taken = new Set((existing.data ?? []).map((row) => row.profile_id as string | null));
  return { rows: people.filter((person) => !taken.has(person.id)) };
}

async function enqueue(
  db: SupabaseClient,
  input: { kind: BroadcastKind; sessionId: string | null },
  actorId: string,
  people: RegisteredPerson[],
) {
  for (const person of people) {
    const mail = mailFor(input.kind, person.email);
    const inserted = await db.from("outbox_messages").insert({
      kind: mail.kind,
      to_email: mail.to,
      subject: mail.subject,
      profile_id: person.id,
      created_by: actorId,
      session_id: input.sessionId,
    });
    if (inserted.error && inserted.error.code !== "23505") return inserted.error.message;
  }
  return null;
}

async function pendingMails(db: SupabaseClient, input: { kind: BroadcastKind; sessionId: string | null }) {
  let query = db.from("outbox_messages").select("id, to_email, subject, kind").eq("kind", input.kind).is("sent_at", null);
  query = input.sessionId ? query.eq("session_id", input.sessionId) : query.is("session_id", null);
  const pending = await query;
  if (pending.error) return { error: pending.error.message };
  return { rows: (pending.data ?? []) as PendingMail[] };
}
