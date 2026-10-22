import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { mailKind } from "./kinds";

export async function loadMensaje(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const row = await db
    .from("outbox_messages")
    .select("id, kind, to_email, subject, profile_id, contact_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (row.error) throw new Error(row.error.message);
  if (!row.data || !mailKind(row.data.kind)) return null;
  return row.data;
}
