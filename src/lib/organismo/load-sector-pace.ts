import "server-only";

import { sectorPace } from "@/lib/cupo/sector-pace";
import { orgDb } from "@/lib/organismo/org-db";

export type SectorPaceLoad =
  | { kind: "closed" }
  | { kind: "error" }
  | { kind: "ready"; pace: Extract<ReturnType<typeof sectorPace>, { open: true }> };

export async function loadSectorPace(slug: string): Promise<SectorPaceLoad> {
  const db = await orgDb();
  if (!db) return { kind: "closed" };
  const sector = await db.from("sectors").select("id").eq("slug", slug).maybeSingle();
  if (sector.error) return { kind: "error" };
  if (!sector.data) return { kind: "closed" };
  const pace = await db.rpc("sector_pace", { p_sector_id: sector.data.id });
  const row = Array.isArray(pace.data) ? pace.data[0] : pace.data;
  if (pace.error || !row) return { kind: "error" };
  const parsed = sectorPace({
    capacity: row.capacity,
    mine: Number(row.mine ?? 0),
    others: Number(row.others ?? 0),
  });
  if (!parsed.open) return { kind: "closed" };
  return { kind: "ready", pace: parsed };
}
