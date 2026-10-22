import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

const tables = [
  "organizations",
  "companies",
  "crm_contacts",
  "profiles",
  "passes",
  "arrivals",
  "sectors",
  "sessions",
] as const;

export async function removeBy(table: (typeof tables)[number], column: string, id: string) {
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "sin sesión" };
  const removed = await db.from(table).delete().eq(column, id);
  if (removed.error) {
    const message = removed.error.message.toLowerCase();
    if (table === "sectors" && (message.includes("restrict") || message.includes("foreign key"))) {
      return { ok: false as const, reason: "el sector tiene cupos en una sesión" };
    }
    return { ok: false as const, reason: removed.error.message };
  }
  return { ok: true as const };
}
