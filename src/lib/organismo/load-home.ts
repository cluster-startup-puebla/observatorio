import { connection } from "next/server";
import { getDirectory } from "@/lib/memory-directory";
import { sectors } from "@/lib/sectors";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { linkStats } from "./link-stats";
import { loadSupabaseHome } from "./load-supabase-home";
import { sectorCuts } from "./sector-cuts";

export async function loadOrgHome(orgId: string, sectorSlug?: string) {
  await connection();
  if (usesSupabaseAuth()) return loadSupabaseHome(orgId, sectorSlug);
  const directory = getDirectory();
  const opens = await directory.opensFor(orgId);
  const names = new Map(sectors.map((sector) => [sector.slug, sector.name]));
  const registrations = new Map<string, number>();
  let conversions = 0;
  for (const sector of sectors) {
    const row = await directory.conversion(orgId, sector.slug);
    registrations.set(sector.slug, row.registrations);
    conversions += row.registrations;
  }
  const visible = sectorSlug ? opens.filter((open) => open.sectorSlug === sectorSlug) : opens;
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
