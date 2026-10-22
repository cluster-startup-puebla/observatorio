import "server-only";

import { sectors } from "@/lib/sectors";
import { opensForOrganization } from "@/lib/supabase/link-opens";
import { linkStats } from "./link-stats";
import { orgDb } from "./org-db";
import { sectorCuts } from "./sector-cuts";

type SectorJoin = { slug: string } | { slug: string }[] | null;

function sectorSlug(joined: SectorJoin) {
  if (!joined) return "";
  return Array.isArray(joined) ? (joined[0]?.slug ?? "") : joined.slug;
}

function emptyHome() {
  const names = new Map(sectors.map((sector) => [sector.slug, sector.name]));
  const totals = linkStats({ opens: [], conversions: 0, now: new Date() });
  return {
    opens: totals.opens,
    conversions: totals.conversions,
    rate: totals.rate,
    bars: totals.bars,
    cuts: sectorCuts([], names, new Map()),
  };
}

export async function loadSupabaseHome(orgId: string, sectorSlugFilter?: string) {
  const db = await orgDb();
  if (!db) return emptyHome();
  const opens = await opensForOrganization(db, orgId);
  const contacts = await db
    .from("crm_contacts")
    .select("sectors(slug)")
    .eq("organization_id", orgId)
    .eq("source", "enlace");
  if (contacts.error) throw new Error(contacts.error.message);
  const registrations = new Map<string, number>();
  for (const row of contacts.data ?? []) {
    const slug = sectorSlug(row.sectors as SectorJoin);
    if (!slug) continue;
    registrations.set(slug, (registrations.get(slug) ?? 0) + 1);
  }
  const conversions = [...registrations.values()].reduce((sum, count) => sum + count, 0);
  const names = new Map(sectors.map((sector) => [sector.slug, sector.name]));
  const visible = sectorSlugFilter ? opens.filter((open) => open.sectorSlug === sectorSlugFilter) : opens;
  const totals = linkStats({ opens, conversions, now: new Date() });
  const chart = linkStats({ opens: visible, conversions, now: new Date() });
  return {
    opens: totals.opens,
    conversions: totals.conversions,
    rate: totals.rate,
    bars: chart.bars,
    cuts: sectorCuts(opens, names, registrations),
  };
}
