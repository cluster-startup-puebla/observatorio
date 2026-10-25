import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid } from "@/lib/ref-token";
import { createSupabaseAnon, readAccessToken } from "@/lib/supabase/auth-session";
import { queueBroadcast } from "./broadcast-queue";
import type { BroadcastKind } from "./broadcast-audience";
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
  return deliverPending(db, queued.rows);
}

async function actor() {
  const token = await readAccessToken();
  if (!token) return null;
  const user = await createSupabaseAnon().auth.getUser(token);
  return user.data.user?.id ?? null;
}
