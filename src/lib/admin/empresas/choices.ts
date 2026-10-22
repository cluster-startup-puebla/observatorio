import "server-only";

import { adminDb } from "@/lib/admin/admin-db";

export async function empresaChoices() {
  const db = await adminDb();
  const empty = { sectors: [] as { id: string; name: string }[], profiles: [] as { id: string; email: string }[] };
  if (!db) return empty;
  const [sectors, profiles, taken] = await Promise.all([
    db.from("sectors").select("id, name").order("position"),
    db.from("profiles").select("id, email, full_name").eq("role", "empresario").order("email"),
    db.from("companies").select("profile_id"),
  ]);
  if (sectors.error) throw new Error(sectors.error.message);
  if (profiles.error) throw new Error(profiles.error.message);
  if (taken.error) throw new Error(taken.error.message);
  const used = new Set((taken.data ?? []).map((row) => row.profile_id));
  return {
    sectors: (sectors.data ?? []).map((row) => ({ id: row.id, name: row.name ?? row.id })),
    profiles: (profiles.data ?? [])
      .filter((row) => !used.has(row.id))
      .map((row) => ({ id: row.id, email: row.full_name || row.email || row.id })),
  };
}
