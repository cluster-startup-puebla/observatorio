import "server-only";

import { currentOption } from "@/lib/sessions/face";
import { orgDb } from "./org-db";

/** Published sessions for the CRM session filter. */
export async function loadCrmSessions() {
  const db = await orgDb();
  if (!db) return [];
  const result = await db
    .from("sessions")
    .select("id, venue, session_on, starts_local, ends_local")
    .not("public_slug", "is", null)
    .order("session_on", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map((row) => currentOption(row));
}
