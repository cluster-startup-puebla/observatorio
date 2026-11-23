import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { looksLikeUuid } from "@/lib/admin/pases/scan";

export type MesaCode =
  | { kind: "profile"; profileId: string }
  | { kind: "rsvp"; rsvpId: string; profileId: string | null };

/** Resolve QR payload: RSVP id, profile id, or legacy non-uuid profile key. */
export async function resolveMesaCode(db: SupabaseClient, raw: string): Promise<MesaCode | null> {
  const code = raw.trim();
  if (!code) return null;
  if (!looksLikeUuid(code)) return { kind: "profile", profileId: code };

  const seat = await db
    .from("session_rsvps")
    .select("id, profile_id")
    .eq("id", code)
    .eq("status", "confirmed")
    .maybeSingle();
  if (seat.error) throw new Error(seat.error.message);
  if (seat.data?.id) {
    return {
      kind: "rsvp",
      rsvpId: String(seat.data.id),
      profileId: seat.data.profile_id ? String(seat.data.profile_id) : null,
    };
  }

  const profile = await db.from("profiles").select("id").eq("id", code).maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  if (profile.data?.id) return { kind: "profile", profileId: String(profile.data.id) };

  return null;
}
