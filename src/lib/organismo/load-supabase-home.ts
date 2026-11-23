import "server-only";

import { sectors } from "@/lib/sectors";
import { opensForOrganization } from "@/lib/supabase/link-opens";
import { enlacePeople, peopleStats } from "./home-conversions";
import { linkStats } from "./link-stats";
import { orgDb } from "./org-db";
import { sectorCuts } from "./sector-cuts";

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

export async function loadSupabaseHome(
  orgId: string,
  sectorSlugFilter?: string,
  sessionId?: string | null,
) {
  const db = await orgDb();
  if (!db) return emptyHome();
  const opens = await opensForOrganization(db, orgId, sessionId);
  const people = await enlacePeople(db, orgId, sessionId);
  const { registrations, conversions, moments } = peopleStats(people);
  const names = new Map(sectors.map((sector) => [sector.slug, sector.name]));
  const visible = sectorSlugFilter ? opens.filter((open) => open.sectorSlug === sectorSlugFilter) : opens;
  const converted = sectorSlugFilter ? moments.filter((row) => row.slug === sectorSlugFilter) : moments;
  const totals = linkStats({ opens, conversions, now: new Date() });
  const chart = linkStats({ opens: visible, conversions, convertedAt: converted, now: new Date() });
  return {
    opens: totals.opens,
    conversions: totals.conversions,
    rate: totals.rate,
    bars: chart.bars,
    cuts: sectorCuts(opens, names, registrations),
  };
}
