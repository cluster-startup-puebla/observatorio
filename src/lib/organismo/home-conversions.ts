import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
export { peopleStats } from "./link-conversions";

export async function enlacePeople(
  db: SupabaseClient,
  orgId: string,
  sessionId?: string | null,
) {
  let query = db
    .from("session_rsvps")
    .select("sector_slug, confirmed_at, created_at")
    .eq("organization_id", orgId)
    .eq("status", "confirmed");
  if (sessionId) query = query.eq("session_id", sessionId);
  const rows = await query;
  if (rows.error) throw new Error(rows.error.message);
  return (rows.data ?? []).map((row) => ({
    slug: (row.sector_slug as string | null) ?? "",
    status: "registrado" as const,
    at: (row.confirmed_at ?? row.created_at) as string,
  }));
}