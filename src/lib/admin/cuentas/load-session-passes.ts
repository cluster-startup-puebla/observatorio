import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { one } from "@/lib/admin/pases/pass-list-embed";

export type CuentaSessionPass = {
  rsvpId: string;
  sessionTitle: string;
  sessionSlug: string;
  issuedAt: string | null;
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
  return (listed.data ?? []).map((row) => {
    const session = one(row.sessions as { title: string | null; public_slug: string | null } | { title: string | null; public_slug: string | null }[] | null);
    const pass = one(row.rsvp_passes as { issued_at: string | null } | { issued_at: string | null }[] | null);
    return {
      rsvpId: String(row.id),
      sessionTitle: session?.title?.trim() || "Sesión",
      sessionSlug: session?.public_slug?.trim() || "",
      issuedAt: pass?.issued_at ?? null,
    };
  });
}
