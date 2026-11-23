import type { SupabaseClient } from "@supabase/supabase-js";
import { ilikePattern } from "@/lib/admin/ilike-pattern";

export async function applyCuentaSearch(
  db: SupabaseClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  q: string,
) {
  if (!q) return query;
  const pattern = ilikePattern(q);
  const quoted = `"${pattern.replace(/"/g, '\\"')}"`;
  const orgs = await db.from("organizations").select("id").ilike("name", pattern);
  if (orgs.error) throw new Error(orgs.error.message);
  const orgIds = (orgs.data ?? []).map((row) => String(row.id));
  const parts = [`full_name.ilike.${quoted}`, `email.ilike.${quoted}`];
  if (orgIds.length) parts.push(`organization_id.in.(${orgIds.join(",")})`);
  return query.or(parts.join(","));
}
