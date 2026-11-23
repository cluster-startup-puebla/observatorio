import { ilikePattern } from "@/lib/admin/ilike-pattern";

/** Sync only — returning a builder from async unwraps the thenable and drops .range. */
export function applyCuentaSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  q: string,
  orgIds: string[] = [],
) {
  if (!q) return query;
  const quoted = `"${ilikePattern(q).replace(/"/g, '\\"')}"`;
  const parts = [`full_name.ilike.${quoted}`, `email.ilike.${quoted}`];
  if (orgIds.length) parts.push(`organization_id.in.(${orgIds.join(",")})`);
  return query.or(parts.join(","));
}
