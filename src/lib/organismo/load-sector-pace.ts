import "server-only";

import { sectorPace } from "@/lib/cupo/sector-pace";
import { orgDb } from "@/lib/organismo/org-db";

export async function loadSectorPace(slug: string) {
  const closed = sectorPace({ capacity: null, mine: 0, others: 0 });
  const db = await orgDb();
  if (!db) return closed;
  const sector = await db.from("sectors").select("id").eq("slug", slug).maybeSingle();
  if (sector.error || !sector.data) return closed;
  const pace = await db.rpc("sector_pace", { p_sector_id: sector.data.id });
  const row = Array.isArray(pace.data) ? pace.data[0] : pace.data;
  if (pace.error || !row) return closed;
  return sectorPace({
    capacity: row.capacity,
    mine: Number(row.mine ?? 0),
    others: Number(row.others ?? 0),
  });
}
