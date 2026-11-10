import "server-only";

import { loadSectorPace } from "@/lib/organismo/load-sector-pace";

export type SectorSeat = { capacity: number | null; filled: number };

export async function loadSectorSeats(slugs: string[]): Promise<Record<string, SectorSeat | null>> {
  const unique = [...new Set(slugs)];
  const entries = await Promise.all(unique.map(async (slug) => [slug, await toSeat(slug)] as const));
  return Object.fromEntries(entries);
}

async function toSeat(slug: string): Promise<SectorSeat | null> {
  const loaded = await loadSectorPace(slug);
  if (loaded.kind === "error") return null;
  if (loaded.kind === "closed") return { capacity: null, filled: loaded.filled };
  return { capacity: loaded.pace.capacity, filled: loaded.pace.filled };
}
