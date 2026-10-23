import { isLinkAccepted } from "@/lib/crm/link-acceptance";

export function linkConversions(rows: { slug: string; status: string | null }[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.slug || !isLinkAccepted(row.status) || row.status === null) continue;
    counts.set(row.slug, (counts.get(row.slug) ?? 0) + 1);
  }
  return counts;
}
