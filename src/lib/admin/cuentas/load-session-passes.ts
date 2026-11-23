import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type CuentaSessionPass = {
  rsvpId: string;
  sessionTitle: string;
  sessionSlug: string;
  issuedAt: string | null;
};

type RsvpRow = {
  id: string;
  sessions: { title: string | null; public_slug: string | null } | null;
  rsvp_passes: { issued_at: string | null } | { issued_at: string | null }[] | null;
};

export async function loadCuentaSessionPasses(
  db: SupabaseClient,
  profileId: string,
  email: string,
): Promise<CuentaSessionPass[]> {
  const mail = email.trim().toLowerCase();
  const listed = await db
    .from("session_rsvps")
    .select("id, sessions(title, public_slug), rsvp_passes(issued_at)")
    .eq("status", "confirmed")
    .or(`profile_id.eq.${profileId},email.eq.${mail}`);
  if (listed.error) throw new Error(listed.error.message);
  return ((listed.data ?? []) as RsvpRow[]).map((row) => {
    const pass = Array.isArray(row.rsvp_passes) ? row.rsvp_passes[0] : row.rsvp_passes;
    return {
      rsvpId: row.id,
      sessionTitle: row.sessions?.title?.trim() || "Sesión",
      sessionSlug: row.sessions?.public_slug?.trim() || "",
      issuedAt: pass?.issued_at ?? null,
    };
  });
}
