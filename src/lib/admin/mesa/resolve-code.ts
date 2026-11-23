import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { looksLikeUuid } from "@/lib/admin/pases/scan";

export type MesaCode = { kind: "profile"; profileId: string } | { kind: "rsvp"; rsvpId: string; profileId: string | null };

export async function resolveMesaCode(db: SupabaseClient, raw: string): Promise<MesaCode | null> {
  const code = raw.trim();
  if (!code) return null;
  if (!looksLikeUuid(code)) return { kind: "profile", profileId: code };

  const listed = await db.rpc("mesa_rsvp_guest", { p_rsvp_id: code });
  if (listed.error) throw new Error(listed.error.message);
  const row = Array.isArray(listed.data) ? listed.data[0] : listed.data;
  if (row) {
    return { kind: "rsvp", rsvpId: code, profileId: (row.profile_id as string | null) ?? null };
  }
  return { kind: "profile", profileId: code };
}