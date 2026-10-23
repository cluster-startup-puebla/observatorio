import "server-only";

import { currentOption } from "@/lib/sessions/face";
import { orgDb } from "./org-db";

export async function loadCurrentSessions() {
  const db = await orgDb();
  if (!db) return [];
  const result = await db
    .from("sessions")
    .select("id, venue, session_on, starts_local, ends_local")
    .eq("is_current", true)
    .order("session_on")
    .order("starts_local");
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map((row) => currentOption(row));
}
