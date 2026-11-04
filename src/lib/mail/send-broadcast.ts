import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid } from "@/lib/ref-token";
import { currentOption } from "@/lib/sessions/face";
import { createSupabaseAnon, readAccessToken } from "@/lib/supabase/auth-session";
import type { BroadcastKind } from "./broadcast-audience";
import { queueBroadcast } from "./broadcast-queue";
import { deliverPending } from "./deliver";

export async function sendBroadcast(
  db: SupabaseClient,
  input: { kind: BroadcastKind; sessionId: string | null },
): Promise<{ sent: number; error?: string; warning?: string }> {
  if ((input.kind === "reminder" || input.kind === "thanks") && !isUuid(input.sessionId ?? "")) {
    return { sent: 0, error: "Elige una sesión." };
  }
  const actorId = await actor();
  if (!actorId) return { sent: 0, error: "sin sesión" };
  const queued = await queueBroadcast(db, input, actorId);
  if ("error" in queued) return { sent: 0, error: queued.error };
  const sessionLabel = await labelFor(db, input.sessionId);
  return deliverPending(db, queued.rows, { sessionLabel, continueHref: null });
}

async function labelFor(db: SupabaseClient, sessionId: string | null) {
  if (!sessionId) return null;
  const found = await db
    .from("sessions")
    .select("venue, session_on, starts_local, ends_local")
    .eq("id", sessionId)
    .maybeSingle();
  if (!found.data) return null;
  return currentOption({ id: sessionId, ...found.data }).label;
}

async function actor() {
  const token = await readAccessToken();
  if (!token) return null;
  const user = await createSupabaseAnon().auth.getUser(token);
  return user.data.user?.id ?? null;
}
