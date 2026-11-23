import type { SupabaseClient } from "@supabase/supabase-js";
import { ilikePattern } from "@/lib/admin/ilike-pattern";

export async function cuentaSearchOrgIds(db: SupabaseClient, q: string) {
  if (!q) return [] as string[];
  const orgs = await db.from("organizations").select("id").ilike("name", ilikePattern(q));
  if (orgs.error) throw new Error(orgs.error.message);
  return (orgs.data ?? []).map((row) => String(row.id));
}
