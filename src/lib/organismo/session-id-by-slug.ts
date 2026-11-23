import "server-only";

import { orgDb } from "./org-db";

export async function orgSessionIdBySlug(publicSlug: string) {
  const db = await orgDb();
  if (!db) return null;
  const result = await db.from("sessions").select("id").eq("public_slug", publicSlug).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data?.id ?? null;
}
