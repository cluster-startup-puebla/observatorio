import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export type SessionChoice = {
  id: string;
  venue: string;
  sessionOn: string | null;
  current: boolean;
};

export async function loadSessionChoices(): Promise<SessionChoice[]> {
  const db = await adminDb();
  if (!db) return [];
  const result = await db
    .from("sessions")
    .select("id, venue, session_on, is_current")
    .order("is_current", { ascending: false })
    .order("session_on", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map((row) => ({
    id: row.id,
    venue: row.venue,
    sessionOn: row.session_on,
    current: Boolean(row.is_current),
  }));
}
