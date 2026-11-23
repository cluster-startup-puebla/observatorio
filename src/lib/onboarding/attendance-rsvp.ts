import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function loadCancelableRsvp(db: SupabaseClient, profileId: string) {
  const profile = await db.from("profiles").select("email").eq("id", profileId).maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  const email = String(profile.data?.email ?? "")
    .trim()
    .toLowerCase();
  if (!email) return null;

  const company = await db.from("companies").select("session_id").eq("profile_id", profileId).maybeSingle();
  if (company.error) throw new Error(company.error.message);
  const sessionId = company.data?.session_id ?? null;

  if (sessionId) {
    const row = await db
      .from("session_rsvps")
      .select("status, cancel_reason, session_id")
      .eq("session_id", sessionId)
      .eq("email", email)
      .maybeSingle();
    if (row.error) throw new Error(row.error.message);
    if (row.data) return row.data;
  }

  const any = await db
    .from("session_rsvps")
    .select("status, cancel_reason, session_id")
    .eq("email", email)
    .eq("status", "confirmed")
    .limit(1)
    .maybeSingle();
  if (any.error) throw new Error(any.error.message);
  return any.data;
}