import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { currentOption } from "@/lib/sessions/face";

export async function loadMailSessions() {
  const db = await adminDb();
  if (!db) return [];
  const result = await db
    .from("sessions")
    .select("id, venue, session_on, starts_local, ends_local")
    .eq("is_current", true)
    .order("session_on")
    .order("starts_local");
  if (result.error) return [];
  return (result.data ?? []).map((row) => currentOption(row));
}
