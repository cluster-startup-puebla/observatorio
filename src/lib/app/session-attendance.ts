import "server-only";

import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

const copy: Record<string, string> = {
  confirmed: "En espera",
  pending: "Tu lugar se confirma aparte",
  cancelled: "Cancelaste tu lugar",
};

/** Attendance label from session_rsvps for this slug. */
export async function sessionAttendanceLabel(token: string, profileId: string, slug: string) {
  const db = createSupabaseWithAccess(token);
  const session = await db.from("sessions").select("id, is_current").eq("public_slug", slug).maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data?.id) {
    return emptyAttendance(null);
  }

  const profile = await db.from("profiles").select("email").eq("id", profileId).maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  const email = String(profile.data?.email ?? "")
    .trim()
    .toLowerCase();
  if (!email) return emptyAttendance(session.data.id);

  const rsvp = await db
    .from("session_rsvps")
    .select("id, status")
    .eq("session_id", session.data.id)
    .eq("email", email)
    .maybeSingle();
  if (rsvp.error) throw new Error(rsvp.error.message);
  const status = rsvp.data?.status ?? "";
  const rsvpId = status === "confirmed" && typeof rsvp.data?.id === "string" ? rsvp.data.id : null;
  return {
    label: copy[status] ?? "",
    canClaim: Boolean(session.data.is_current) && status !== "confirmed",
    canCancel: status === "confirmed",
    sessionId: session.data.id,
    rsvpId,
  };
}

function emptyAttendance(sessionId: string | null) {
  return { label: "", canClaim: false, canCancel: false, sessionId, rsvpId: null as string | null };
}
